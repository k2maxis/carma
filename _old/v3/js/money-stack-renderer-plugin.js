(function($, undefined) {

    /** MoneyStack Service Class (core for plugin below) */
    function MoneyStack(arg) {
        $.extend(this, this.DEF_ARGS, arg);

        this.substrate = this.root.find('.stack-area');

        this.valueContainer = this.root.find('.price-value');
        this.labelContainer = this.root.find('.price-label');
        this.priceNumbers = this.valueContainer.add(this.labelContainer).wrapAll('<div class="price-numbers" />').parent();

        this.initValue(this.value);
    }
    MoneyStack.prototype = {
        constructor: MoneyStack,

        DEF_ARGS: {
            scaleRatio: 1,
            maxRenderedValue: 50000
        },

        initValue: function(value) {
            this.value = ($.isNumeric(value) && parseInt(value)) || 0;
            this.initQueue();
            return this;
        },

        initQueue: function() {
            var balance = Math.min(this.value, this.maxRenderedValue),
                i = -1,
                stackItem;

            this.queue = [];

            while ((stackItem = this.stackItems[++i]) && balance > 0) {
                balance = this.appendQueue(balance, stackItem);
            }
        },

        appendQueue: function(value, stackItem) {
            var balance = value % stackItem.size;

            this.queue.push($.extend({}, stackItem, {
                count: (value - balance) / stackItem.size
            }));

            return balance;
        },

        buildStackItem: function(src) {
            var item = this.ITEM_TPL.clone().attr('src', src).appendTo(this.substrate);
            return item.height((item.height() * this.scaleRatio) + 'px');
        },

        getOffset: function(stackItemData, prevStackItemData) {
            return (stackItemData.offsetsByPrevStackItem[prevStackItemData.size] || 0) * this.scaleRatio;
        },

        render: function() {
            var self = this,
                stackItemData,
                prevStackItemData,
                prevStackItem,
                bottom = 0,
                shadowIndex = ((this.value >= this.bigShadowTreshold) + 0),
                shadowStackItem;

            // var iterationCount = 0; // just for debug

            if (!this.queue.length) {
                return;
            }

            this.substrate.html('');

            // Async (non blocking) rendering
            (function() {
                // console.log('iterationCount', iterationCount++);

                // First iteration
                if (stackItemData === undefined) {
                    stackItemData = self.queue.shift();

                    shadowStackItem = self.buildStackItem(self.shadowItems[shadowIndex]).addClass('stack-shadow-' + shadowIndex);
                    shadowStackItem.css('left', (parseInt(shadowStackItem.css('left')) * self.scaleRatio) + 'px');
                    shadowStackItem.css('bottom', (parseInt(shadowStackItem.css('bottom')) * self.scaleRatio) + 'px');

                    setTimeout(arguments.callee, 35);

                    return;
                }

                if (stackItemData.count--) {
                    // This iteration render stack items of current stack type
                    if (prevStackItemData && prevStackItem) {
                        bottom += prevStackItem.height() + self.getOffset(stackItemData, prevStackItemData);
                    }

                    prevStackItem = self.buildStackItem(stackItemData.img).css('bottom', bottom);

                    prevStackItemData = stackItemData;
                } else if (!(stackItemData = self.queue.shift())) { // Try to take next/new stack type
                    // Last iteration, go out from closure function
                    self.priceNumbers.css('bottom', (parseInt(prevStackItem.css('bottom')) + prevStackItem.height() + 20) + 'px');
                    self.renderNumbers();
                    return;
                }

                setTimeout(arguments.callee, 35);
            })();
        },

        renderNumbers: function() {
            this.labelContainer;
            this.valueContainer.html('US$ ' + this.value);
            this.priceNumbers.show();
        },

        clearState: function() {
            this.priceNumbers.hide();
            this.substrate.html('');
        }
    };

    /** MoneyStack jQuery Plugin */
    $.fn.MoneyStack = function(arg) {
        if (!this.data('moneyStackInstance')) {
            MoneyStack.prototype.ITEM_TPL = $('<img class="stack-item"/>');

            this.data('moneyStackInstance', new MoneyStack($.extend({
                root: this
            }, arg)));
        }
        return this;
    };
})(jQuery);
