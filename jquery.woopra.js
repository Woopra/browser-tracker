(function ($) {
    $.fn.woopra = function(action, eventName, properties, options) {
        var opts = $.extend({}, $.fn.woopra.defaults, options);
        if (!action || !eventName) {
            return;
        }

        var serializeObject = function(arr) {
            var o = {};
            $.each(arr, function() {
                if ($.inArray(this.name, opts.exclude) === -1) {
                    if (o[this.name] !== undefined) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                }
            });
            return o;
        };

        var bindClick = function() {
            var completed = false;

            return this.each(function() {
                var el = $(this);
                el.one('click', function(e) {
                    e.preventDefault();

                    woopra.track(eventName, properties, function() {
                        completed = true;
                        el.click();
                    });

                    setTimeout(function() {
                        !completed && el.click();
                    }, 250);
                });
            });
        };

        var bindForm = function() {
            var completed = false;

            return this.each(function() {
                var el = $(this);

                el.one('submit', function(e) {
                    var form;
                    var data;

                    e.preventDefault();

                    debugger;
                    if (opts.excludePasswords) {
                        form = el.find('[type!=password]').serializeArray();
                    }
                    else {
                        form = el.serializeArray();
                    }

                    data = serializeObject(form);

                    woopra.track(eventName, data, function() {
                        completed = true;
                        el.submit();
                    });

                    setTimeout(function() {
                        !completed && el.submit();
                    }, 250);
                });
            });
        };

        if (action === 'click') {
            return bindClick.call(this);
        }
        else if (action === 'form') {
            return bindForm.call(this);
        }
    };

    $.fn.woopra.defaults = {
        excludePasswords: true,
        exclude: []
    };
}(jQuery));

