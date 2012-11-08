(function($, namespace, undefined) {
    var moneyStackInitData,
        images = ['img/ajax-loader.gif'];

    /** MoneyStack Autocomplete widget plugin */
    $.widget("ui.MoneyStackAutocomplete", $.ui.autocomplete, {
        _initSource: function() {
            var self = this,
                fnSuper;

            $.ui.autocomplete.prototype._initSource.apply(this, arguments);

            fnSuper = this.source;

            this.source = function(request, response) {
                var additionData = ($.isFunction(self.options.buildRequestAdditionData)
                        && self.options.buildRequestAdditionData()) || {};

                return fnSuper.call(self, $.extend(additionData, {
                    termName: this.element.attr('name'),
                    termValue: this.element.val()
                }), response);
            };
        },

        _suggest: function() {
            var result,
                $menu = this.menu.element;

            $menu.css('visibility', 'hidden');
            $menu.removeClass('ui-autocomplete-sized');
            $menu.css('height', 'auto');

            result = $.ui.autocomplete.prototype._suggest.apply(this, arguments);

            if ($menu.height() > this.options.MAX_SUGGEST_HEIGHT) {
                $menu.addClass('ui-autocomplete-sized');
                $menu.css('height', this.options.MAX_SUGGEST_HEIGHT + 'px');
            }

            $menu.css('visibility', 'visible');

            return result;
        }
    });
    $.extend($.ui.MoneyStackAutocomplete.prototype.options, {
        MAX_SUGGEST_HEIGHT: 350
    });

    /** MoneyStackData App Class */
    namespace.MoneyStacksApp = function(arg) {
        $.extend(this, this.DEF_ARGS, arg);

        this.ajaxLoader = $('.ajax-loader');

        this.initForm($('.form-with-light form'), false);

        this.stackYour = $('.dollar-stack-your').MoneyStack(moneyStackInitData).data('moneyStackInstance');
        this.stackReal = $('.dollar-stack-real').MoneyStack(moneyStackInitData).data('moneyStackInstance');

        this.$footerTopText = $('.footer-top-text');
	/**	this.$basedText = $('.based-text'); */
    };
    namespace.MoneyStacksApp.prototype = {
        constructor: namespace.MoneyStacksApp,

        FOOTER_TOP_HTML: '</p>*Based on num_cars verified transactions over the last 30 days.</p>',
		
	/** This price is trending price_trend% in the last 12 months \  (adjusted for normal depreciation). */		

			
			
	/**	BASED_TEXT_HTML: '</p>based on num_cars real transactions in over the last 30 days</p>,	*/
			
        DEF_ARGS: {},

        /** $.unique works incorrectly in this case */
        unique: function(arr) {
            var map = {},
                res = [];

            $.each(arr, function(idx, item) {
                if (item && !map[item]) {
                    map[item] = true;
                    res.push(item);
                }
            });

            return res;
        },

        initForm: function(el, isNeedVaidation) {
            (this.form = el).submit($.proxy(this.formSubmitHandler, this));
            this.initInputs();
        },

        initInputs: function(arr) {
            this.manufacturerInput = this.form.find('[name=manufacturer]');
            this.modelInput = this.form.find('input[name=model]');
            this.yearInput = this.form.find('input[name=year]');
            this.priceInput = this.form.find('input[name=price]');

            this.form.delegate('input[type=text]', 'focus', function() {
                  $(this).val('');
            });

            this.initAutpcompletes();
        },

        initAutpcompletes: function() {
            this.manufacturerInput.MoneyStackAutocomplete({
                source: 'service/autocompletes.php',
                buildRequestAdditionData: $.proxy(function() {
                    return {
                        relatedName1: this.modelInput.attr('name'),
                        relatedValue1: this.modelInput.val(),
                        relatedName2: this.yearInput.attr('name'),
                        relatedValue2: this.yearInput.val()
                    };
                }, this)
            });
            this.modelInput.MoneyStackAutocomplete({
                source: 'service/autocompletes.php',
                buildRequestAdditionData: $.proxy(function() {
                    return {
                        relatedName1: this.manufacturerInput.attr('name'),
                        relatedValue1: this.manufacturerInput.val(),
                        relatedName2: this.yearInput.attr('name'),
                        relatedValue2: this.yearInput.val()
                    };
                }, this)
            });
            this.yearInput.MoneyStackAutocomplete({
                source: 'service/autocompletes.php',
                buildRequestAdditionData: $.proxy(function() {
                    return {
                        relatedName1: this.manufacturerInput.attr('name'),
                        relatedValue1: this.manufacturerInput.val(),
                        relatedName2: this.modelInput.attr('name'),
                        relatedValue2: this.modelInput.val()
                    };
                }, this)
            });
        },

        formSubmitHandler: function(e, form) {
            e.preventDefault();

            this.ajaxLoader.show();

            this.realPrice = parseInt(this.priceInput.val());

            this.stackReal.clearState();
            this.stackYour.clearState();

            this.xhr && this.xhr.abort();

            this.manufacturerInput = this.form.find('[name=manufacturer]');
            this.modelInput = this.form.find('input[name=model]');
            this.yearInput = this.form.find('input[name=year]');
            this.priceInput = this.form.find('input[name=price]');

            this.xhr = $.ajax({
                url: 'service/calculateprice.php',
                data: {
                    manufacturer: this.manufacturerInput.val(),
                    model: this.modelInput.val(),
                    year: this.yearInput.val()
                },
                dataType: 'json',
                success: $.proxy(this.submitResponseHandler, this),
                error: $.proxy(function() {
                    this.ajaxLoader.hide();
                    $.modaldialog.warning('An error occurred while form submitted.', {
                        title: 'Houston, we have a problem!'
                    });
                }, this)
            });

            return false;
        },

        submitResponseHandler: function(data) {
            this.ajaxLoader.hide();

            if (data.msg) {
                return $.modaldialog.warning(data.msg, {
                    title: 'Houston, we have a problem!'
                });
            }

            if (!$.isNumeric(data.price)) {
                return $.modaldialog.warning('Invalid response data', {
                    title: 'Houston, we have a problem!'
                });
            }

            this.$footerTopText.html(this.FOOTER_TOP_HTML.replace('num_cars', data.num_cars)
                    .replace('price_trend', data.price_trend));
					
		/**	this.$basedText.html(this.BASED_TEXT_HTML.replace('num_cars', data.num_cars));	*/		

            this.stackReal.initValue(this.realPrice).render();
            this.stackYour.initValue(this.youPrice = data.price).render();
        }
    };

    /** Define MoneyStack init data */
    moneyStackInitData = {
        scaleRatio: 0.82,

        bigShadowTreshold: 2000,

        // maxRenderedValue: 45000, // 50000 - default value, the excess will not be rendered

        stackItems: [/*{
            size: 10000,
            offsetsByPrevStackItem: {
                10000: -88,
            },
            img: 'img/stack-item-10000.png'
        },*/ {
            size: 5000,
            offsetsByPrevStackItem: {
                10000: -92,
                5000: -92
            },
            maxOffsetX: 8,
            img: ['img/stack-item-5000.png']
        }, {
            size: 1000,
            offsetsByPrevStackItem: {
                10000: -84,
                5000: -85,
                1000: -88,
            },
            maxOffsetX: 8,
            img: ['img/stack-item-1000-0.png', 'img/stack-item-1000-1.png']
        }, {
            size: 100,
            offsetsByPrevStackItem: {
                10000: -76,
                5000: -77,
                1000: -78,
                100: -78.1,
            },
            maxOffsetX: 6,
            img: 'img/stack-item-100.png'
        }],

        shadowItems: ['img/shadow-item-0.png', 'img/shadow-item-1.png']
    };

    /** Animated images preloading */
    $.each(moneyStackInitData.stackItems, function(index, value) {
        if ($.isArray(value.img)) {
            images = images.concat(value.img);
        } else {
            images.push(value.img);
        }
    });
    $.imgpreload(images.concat(moneyStackInitData.shadowItems));

})(jQuery, window);
