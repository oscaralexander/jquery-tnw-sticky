/**
 * TNW Sticky
 * Copyright © 2017, Alexander Griffioen <alexander@thenextweb.com>
 * Published under MIT license.
 */

const pluginName = 'tnwSticky'

class TNWSticky {
    constructor(el, options) {
        this.options = $.extend({}, this.defaults, options)
        this.$el = $(el)
        this.init()
    }

    init() {
        this.$content = this.$el.find('.' + this.options.classNameContent).first()
        this.$content.wrap($('<div/>').addClass(this.options.classNameContentWrapper))
        this.$contentWrapper = this.$content.parent()
        this.$contentWrapper.css('width', '100%')
        this.contentHeight = 0
        this.contentTop = 0
        this.isStickable = false;
        this.isVisible = false;
        this.offset = (this.$el.attr('data-sticky-offset') || 0)
        this.stickyEnd = 0
        this.stickyStart = 0

        // Get initial dimensions
        this.updateDimensions()

        // Update dimensions every second
        this.interval = setInterval(this.updateDimensions.bind(this), 1000)

        // Handle screen resizes
        $(window).on('orientationchange resize', this.onResize.bind(this))

        // Handle scrolling
        $(window).on('tnw:scroll', this.onScroll.bind(this));
    }

    onResize(e) {
        if (this.interval) {
            clearInterval(this.interval)
        }

        this.$content.css({
            bottom: 'auto',
            position: 'static',
            top: 0
        });

        setTimeout(this.updateDimensions.bind(this), 10)
        this.interval = setInterval(this.updateDimensions, 1000)
    }

    onScroll(e) {
        if (this.isStickable && this.isVisible) {
            if (e.top > this.stickyStart) {
                // Make sticky
                if ((e.top + this.contentHeight) < this.stickyEnd) {
                    // Stick content to top of screen
                    this.$content.css({
                        bottom: 'auto',
                        position: 'fixed',
                        top: this.offset + 'px'
                    })
                } else {
                    // Stick content to bottom of sidebar
                    this.$content.css({
                        bottom: this.$el.css('padding-bottom'),
                        position: 'absolute',
                        top: 'auto'
                    })
                }
            } else {
                // Unstick
                this.$content.css({
                    bottom: 'auto',
                    position: 'static',
                    top: 0
                })
            }
        }
    }

    updateDimensions() {
        this.isVisible = this.$el.is(':visible')

        if (this.isVisible) {
            // Set content width
            this.$content.css('width', this.$contentWrapper.width())

            // Get sidebar content height and top
            this.contentHeight = Math.ceil(this.$content.outerHeight(true))
            this.contentTop = this.$contentWrapper.offset().top

            // Set sticky breakpoints
            this.stickyStart = this.contentTop - this.offset
            this.stickyEnd = (this.contentTop + this.$el.height()) - this.offset

            // Determine if sidebar should get sticky
            this.isStickable = this.$el.height() > this.contentHeight

            // Handle resizing
            $(window).on('orientationchange resize', this.onResize.bind(this));
        }
    }
}

TNWSticky.prototype.defaults = {
    classNameContent: 'js-tnwSticky-content',
    classNameContentWrapper: 'js-tnwSticky-contentWrapper'
}

$.fn[pluginName] = function (options) {
    return this.each(function () {
        let instance = $(this).data(pluginName)

        if (!instance) {
            $(this).data(pluginName, new TNWSticky(this, options))
        } else {
            if (typeof options === 'string') {
                instance[options]()
            }
        }
    })
}