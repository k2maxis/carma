(function($, namespace, undefined) {
    /** MoneyStackData App Class */
    namespace.MoneyStacksApp = function(arg) {
        $.extend(this, this.DEF_ARGS, arg);

        this.ajaxLoader = $('.ajax-loader');

        this.initForm($('.form-with-light form'), false);

        this.manufacturerInput = this.form.find('input[name="manufacturer"]');
        this.modelInput = this.form.find('input[name="model"]');
        this.yearInput = this.form.find('input[name="year"]');
        this.priceInput = this.form.find('input[name="price"]');

        this.stackYour = $('.dollar-stack-your').MoneyStack(moneyStackInitData).data('moneyStackInstance');
        this.stackReal = $('.dollar-stack-real').MoneyStack(moneyStackInitData).data('moneyStackInstance');

        // this.stackYour.initValue(12200).render();
    };
    namespace.MoneyStacksApp.prototype = {
        constructor: namespace.MoneyStacksApp,

        DEF_ARGS: {},

        initForm: function(el, isNeedVaidation) {
            this.form = el;

            if (!isNeedVaidation) {
                this.form.submit($.proxy(this.formSubmitHandler, this));
                return;
            }

            this.formValidator = (this.form = $('.form-with-light form')).validate({
                submitHandler: $.proxy(this.formSubmitHandler, this),
                rules: {
                    manufacturer: {
                        required: true
                    },
                    model: {
                        required: true
                    },
                    year: {
                        required: true,
                        number: true
                    },
                    price: {
                        required: true,
                        number: true
                    }
                },
                messages: {
                    manufacturer: 'Please enter manufacturer',
                    model: 'Please enter model',
                    year: 'Please enter a valid year',
                    price: 'Please enter price'
                }
            });
        },

        formSubmitHandler: function(e, form) {
            // console.log(this);
            e.preventDefault();

            this.ajaxLoader.show();

            this.realPrice = parseInt(this.priceInput.val());

            this.stackReal.clearState();
            this.stackYour.clearState();

            this.debug && this.submitResponseHandler({
                youPrice: this.debug.findYouyPriceByRealPrice(this.realPrice)
            });

            return false;
        },

        submitResponseHandler: function(data) {
            var self = this;

            if (!$.isNumeric(data.youPrice)) {
                return alert('Invalid response data!');
            }

            setTimeout(function() {
                self.stackReal.initValue(self.realPrice).render();
                self.stackYour.initValue(self.youPrice = data.youPrice).render();
                self.ajaxLoader.hide();
            }, Math.random() * 2000 + 1); // Math.random() * 3000 + 1);
        }
    };

    /** Define MoneyStack init data */
    var moneyStackInitData = {
        scaleRatio: 0.85,

        bigShadowTreshold: 2000,

        // maxRenderedValue: 45000, // 50000 - default value, the excess will not be rendered

        stackItems: [{
            size: 10000,
            offsetsByPrevStackItem: {
                10000: -88,
            },
            img: 'img/stack-item-10000.png'
        }, {
            size: 5000,
            offsetsByPrevStackItem: {
                10000: -92,
                5000: -92
            },
            img: 'img/stack-item-5000.png'
        }, {
            size: 1000,
            offsetsByPrevStackItem: {
                10000: -84,
                5000: -85,
                1000: -88,
            },
            img: 'img/stack-item-1000.png'
        }, {
            size: 100,
            offsetsByPrevStackItem: {
                10000: -76,
                5000: -77,
                1000: -78,
                100: -78.1
            },
            img: 'img/stack-item-100.png'
        }],

        shadowItems: ['img/shadow-item-0.png', 'img/shadow-item-1.png']
    };

    $.imgpreload(['img/stack-item-10000.png', 'img/stack-item-5000.png', 'img/stack-item-1000.png',
        'img/stack-item-100.png', 'img/shadow-item-0.png', 'img/shadow-item-1.png', 'img/ajax-loader.gif']);

})(jQuery, window);
