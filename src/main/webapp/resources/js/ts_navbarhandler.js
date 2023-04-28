/**
 * Name: ts_nav_bar_handler.js
 *
 * Creator: Fabian Frank (ffr)
 *
 * Date: 2020-09-03 ff.
 *
 * Description: Javascript ts_nav_bar_handler.js implementation.
 *
 * Copyright (c) 2020 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.navbarhandler) window.navbarhandler = function ($) {
        const NavBarHandler = {
            toggleWidth: 1134, // Pixel width, where the switch between the two nav bars will happen
            initialized: false, // Flag for checking if the navbarhandler was initialized

            navBarElement: null, // Initialized materialize (side)nav element
            dropDownElements: null, // Initialized materialize dropdown elements

            currentNavBar: null // NAV_BAR_TYPE
        };

        const NAV_BAR_TYPE = {
            NAV_BAR: "0",
            NAV_BAR_SIDE: "1"
        };

        NavBarHandler.init = function() {
            navbarhandler.handleCurrentState();

            $(window).on("resize", function() {
                navbarhandler.repositionOpenedDropDowns();
                navbarhandler.handleCurrentState();
            });

            getNavBar().removeClass("hide");
            navbarhandler.initialized = true;
        };

        NavBarHandler.handleCurrentState = function() {
            let currentWidth = $(window).width();

            if(currentWidth >= NavBarHandler.toggleWidth) {
                if(navbarhandler.currentNavBar === null || navbarhandler.currentNavBar === NAV_BAR_TYPE.NAV_BAR_SIDE) {
                    navbarhandler.activateNavBar()
                }
            } else {
                if(navbarhandler.currentNavBar === null || navbarhandler.currentNavBar === NAV_BAR_TYPE.NAV_BAR) {
                    navbarhandler.activateSidenav()
                }
            }
        };

        /**
         * Repositions the opened dropdown at the position of its parent
         */
        NavBarHandler.repositionOpenedDropDowns = function() {
            let dropDown = $(".dropdown-content:visible");

            if(dropDown.length) {
                let parent = $("a[data-target='" + dropDown.attr("id") + "']");

                if(parent.length) {
                    dropDown.css("left", parent.position().left);
                }
            }
        };

        NavBarHandler.activateSidenav = function() {
            NavBarHandler.currentNavBar = NAV_BAR_TYPE.NAV_BAR_SIDE;

            closeDropDownElements();
            modifyNavBar();
            modifyDropDownElements();
        };

        NavBarHandler.activateNavBar = function() {
            NavBarHandler.currentNavBar = NAV_BAR_TYPE.NAV_BAR;

            closeDropDownElements();
            resetNavBarElement();
            modifyNavBar();
            modifyDropDownElements();
        };

        /**
         * Modifies the nav bar for the switch base on the current type
         */
        function modifyNavBar() {
            let navBar = getNavBar();
            let navBarTrigger = getNavBarTrigger();

            if (navbarhandler.currentNavBar === NAV_BAR_TYPE.NAV_BAR) {
                navBarTrigger.attr("style", "display: none !important");
                navBar.attr("id", "nav-desktop");
                navBar.attr("class", "toggle-nav-bar right");

            } else {
                navBarTrigger.attr("style", "display: block !important");
                navBar.attr("id", "nav-mobile");
                navBar.attr("class", "toggle-nav-bar sidenav");

                navbarhandler.navBarElement = M.Sidenav.init(navBar);
            }

            if(!navbarhandler.initialized) {
                navBar.addClass("hide");
            }
        }

        /**
         * Modifies the drop down elements.
         */
        function modifyDropDownElements() {
            if (navbarhandler.currentNavBar === NAV_BAR_TYPE.NAV_BAR) {
                navbarhandler.dropDownElements = M.Dropdown.init($('nav .dropdown-trigger'), {coverTrigger: false, autoTrigger: true, closeOnClick: false});
            } else {
                navbarhandler.dropDownElements = M.Dropdown.init($('nav .dropdown-trigger'), {outDuration: 0, coverTrigger: false, autoTrigger: true, closeOnClick: false});
            }

        }

        /**
         * Closes all opened drop down menus
         */
        function closeDropDownElements() {
            if(navbarhandler.dropDownElements !== null) {
                navbarhandler.dropDownElements.forEach(element => {
                    element.close();
                })
            }
        }

        /**
         * Destroys the current active nav bar
         */
        function resetNavBarElement() {
            if ($.isArray(navbarhandler.navBarElement) && navbarhandler.navBarElement.length > 0) {
                navbarhandler.navBarElement[0].destroy();
                navbarhandler.navBarElement = null;
            }
        }

        function getNavBarTrigger() {
            return $(".sidenav-trigger");
        }

        function getNavBar() {
            return $(".toggle-nav-bar");
        }

        return NavBarHandler;
    }(jQuery);
})();
