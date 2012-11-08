(function($, namespace, undefined) {

    /** MoneyStack Autocomplete widget plugin */
    $.widget("ui.MoneyStackAutocomplete", $.ui.autocomplete, {
        _init: function() {
            var fields = this.options.fields = [];

            $.each(this.options.FIELD_TO_INDEX_RELATIONS, function(key, value) {
                fields.push($('[name=' + key + ']'));
            });

            // Override element "val" method (to avoid patchig common jquery ui class)
            this.element.val = (function(elContext, elSuperFn, selfContext) {
                return function(value) {
                    if ($.isArray(value)) {
                        $.each(value, function(idx, val) {
                            fields[idx].get(0).value = val;
                        });
                        return elContext;
                    }
                    return elSuperFn.apply(elContext, arguments);
                };
            })(this.element, this.element.val, this);

            return $.ui.autocomplete.prototype._init.apply(this, arguments);
        },

        _normalize: function(items) {
            $.each(items, function(idx, val) {
                val.value = val;
            });
            return items;
        },

        _initSource: function() {
            var self = this;

            if ($.isArray(this.options.source)) {
                this.source = function(request, response) {
                    response(self.filter(self.options.source, request.term));
                };
            } else {
                $.ui.autocomplete.prototype._initSource.apply(this, arguments);
            }

            // Wrap function to collect into request all non empty form inputs values, to pass while ajax request
            this.source = (function(fnSuper) {
                return function(request, response) {
                    var req = {
                        term: self.element.val()
                    };

                    $.each(self.options.fields, function(idx, field) {
                        (val = field.val()) && (req[field.attr('name')] = val);
                    });

                    return fnSuper.call(self, req, response);
                };
            })(this.source);
        },

        filter: function(array, term) {
            var fieldIndex = this.options.FIELD_TO_INDEX_RELATIONS[this.element.attr('name')];
                matcher = new RegExp($.ui.autocomplete.escapeRegex(term), 'i');

            return $.grep(array, function(lineArray) {
                return matcher.test(lineArray[fieldIndex]);
            });
        },

        _renderItem: function(ul, lineArray) {
            var renderedItem = $.ui.autocomplete.prototype._renderItem.apply(this, arguments);

            renderedItem.children('a').html($.map(lineArray, function(item, idx) {
                return '<div class="item-' + idx + '">'+  item + '</div>';
            }).join(''));
        },

        _suggest: function() {
            var result;

            this.menu.element.css('visibility', 'hidden');
            this.menu.element.removeClass('ui-autocomplete-sized');
            this.menu.element.css('height', 'auto');

            result = $.ui.autocomplete.prototype._suggest.apply(this, arguments);

            if (this.menu.element.height() > this.options.MAX_SUGGEST_HEIGHT) {
                this.menu.element.addClass('ui-autocomplete-sized');
                this.menu.element.css('height', this.options.MAX_SUGGEST_HEIGHT + 'px');
            }

            this.menu.element.css('left', this.options.fields[0].parent().offset().left + 'px');
            this.menu.element.css('visibility', 'visible');

            return result;
        }
    });

    $.extend($.ui.MoneyStackAutocomplete.prototype.options, {
        FIELD_TO_INDEX_RELATIONS: {
            manufacturer: 0,
            model: 1,
            year: 2,
            price: 3
        },
        MAX_SUGGEST_HEIGHT: 350
    });

})(jQuery, window);
