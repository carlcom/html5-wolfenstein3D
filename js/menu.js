/** 
 * @namespace 
 * @description Game menu management
 * Only one menu can be active at a time. Each menu can have an "active" li, even if the menu is not active.
 */
Wolf.Menu = (function() {
    var setupDone = false,
        menuInputActive = false,
        audioEnabled = false,
        activeMenu,
        activeEpisode,
        messageBlink,
        activeSkill;
        
    var keySprites = {}, 
        keySpriteNames = [
            "BLANK", 
            "QUESTION",
            "SHIFT",
            "SPACE",
            "CTRL",
            "LEFT",
            "RIGHT",
            "UP",
            "DOWN",
            "ENTER",
            "DEL",
            "PGUP",
            "PGDN",
            "INS",
            "SLASH",
            "HOME",
            "COMMA",
            "PERIOD",
            "PLUS",
            "MINUS",
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z"
        ];
        
    keySpriteNames.forEach(function (name, index) {
        if (name !== "") {
            keySprites[name] = index;
        }
    });


    function playSound(file) {
        if (audioEnabled) {
            Wolf.Sound.startSound(file);
        }
    }

    // Slider color split 
    function colorme(s) {
        var val = s.val();
        s.context.style.background = 'linear-gradient(to right, #ff0 0%, #ff0 ' + val + '%, #111 ' + val + '%, #111 100%)';
    }

    function setActiveItem(item) {
        playSound("lsfx/005.ogg");
        
        activeMenu.find("li").removeClass("active");
        item.addClass("active");
        item.find("input[type='range']").focus();

        if (activeMenu.hasClass("skill")) {
            activeMenu.find("div.face")
                .removeClass()
                .addClass("face " + item.data("skill"));
        }
    }
    
    /** 
     * @description Bind events to menu items
     * @private 
     */
    function setupEvents() {
        $(document).on("keydown", function(e) {

            if (!$("#menu").is(":visible")) {
                return;
            }
            if (!menuInputActive) {
                return;
            }

            var activeIndex = activeMenu.find("li.active").first().index();

            switch (e.which) {
                case 37: // Left arrow
                case 39: // Right arrow: if a range input is active, slide it
                    if (activeMenu.hasClass("levels")) {
                        activeIndex += 5; // half of the levels
                        setLevel();
                    }
                    else {
                        // Check if the active element is a range input
                        var activeElement = document.activeElement;

                        if (activeElement && activeElement.type === 'range') {
                            var currentValue = parseInt($(activeElement).val(), 10);

                            switch (e.which) {
                                case 37: // Left arrow, lower value by 5
                                    $(activeElement).val(Math.max(currentValue - 5, 0)).trigger('input');
                                    break;
                                case 39:
                                    $(activeElement).val(Math.min(currentValue + 5, 100)).trigger('input');
                                    break;
                            }
                        }
                    }
                    break;
                case 38: // Up
                case 40: // Dpwn
                    activeIndex += e.which - 39;
                    if (activeMenu.hasClass("episodes")) { // only scroll with keys, not mouse
                        var itemTop = setLevel().position().top;
                        var activeUL = activeMenu.find("ul");
                        var scrollPosition = itemTop - activeUL.position().top + activeUL.scrollTop();

                        activeUL.scrollTop(scrollPosition);
                    }
                    else {
                        setLevel();
                    }
                    break;
                case 13:
                case 32:
                    activeMenu.find("li").eq(activeIndex).trigger("click");
                    break;
                case 27: // ESC
                    var back = activeMenu.data("backmenu");
                    if (back) {
                        playSound("lsfx/039.ogg");
                        show(back);
                    }
                    return;
            }

            function setLevel() {
                var items = activeMenu.find("li:not(.hidden)");
                if (activeIndex < 0) {
                    activeIndex += items.length;
                }
                activeIndex %= items.length;
                setActiveItem(items.eq(activeIndex));
                return items.eq(activeIndex);
            }
        });
        
        $("#menu li").mouseover(function () {
            if (!menuInputActive) {
                return;
            }
            setActiveItem($(this));
        });

        $("#menu li").on("click", function (e) {
            audioEnabled = true;
            if (!menuInputActive) {
                return;
            }

            playSound("lsfx/032.ogg");
            
            var $this = $(this),
                sub = $this.data("submenu");
            if (sub) {
                show(sub);
                e.stopPropagation();
            }

            if ($this.hasClass("mouseenabled")) {
                var mouseOn = Wolf.Game.isMouseEnabled();
                $("div.light", $this).toggleClass("on", !mouseOn);
                Wolf.Game.enableMouse(!mouseOn);
            }

            if ($this.hasClass("customizekeys")) {
                customizeKeys($this);
                e.stopPropagation();
            } 

            if ($this.hasClass("showtiming")) {
                var showTiming = Wolf.Game.getShowTiming();
                $("div.light", $this).toggleClass("on", !showTiming);
                Wolf.Game.setShowTiming(!showTiming);
            }

            if ($this.hasClass("showLog")) {
                var showLog = Wolf.Game.getShowLog();
                $("div.light", $this).toggleClass("on", !showLog);
                Wolf.Game.setShowLog(!showLog);
            }
            
        });


        $("#menu div.menu.sound li input[type='range']").on("input", function (e) {
            if (!menuInputActive) {
                return;
            }
            var $this = $(this)
            if ($this.hasClass("fx")) {
                colorme($this);
                Wolf.Sound.setFxVolume(this.value);
            }

            if ($this.hasClass("music")) {
                colorme($this);
                Wolf.Sound.setMusicVolume(this.value);
            }

        });
        
        $("#menu div.menu.episodes li").on("click", function(e) {
            if (!menuInputActive) {
                return;
            }
            var episode = $(this).data("episode");
            if (Wolf.Game.isPlaying()) {
                showMessage("confirm-newgame", true, function(result) {
                    if (result) {
                        activeEpisode = episode;
                        show("skill");
                    } else {
                        show("main");
                    }
                });
            } else {
                activeEpisode = episode;
                show("skill");
            }
        });
        
        $("#menu div.menu.skill li").on("click", function(e) {
            if (!menuInputActive) {
                return;
            }
            activeSkill = $(this).data("skill");
        });
        
        $("#menu div.menu.main li.resumegame").on("click", function(e) {
            if (!menuInputActive) {
                return;
            }
            if (Wolf.Game.isPlaying()) {
                hide();
                Wolf.Game.resume();
            }
        });
        
        $("#menu div.menu.main li.readthis").on("click", function(e) {
            if (!menuInputActive) {
                return;
            }
            menuInputActive = false;
            $("#menu").fadeOut(null, function() {
                showText("help", 11, function() {
                    $("#menu").fadeIn();
                });
            });
            e.stopPropagation();
        });
        
        $("#menu div.menu.levels li").on("click", function(e) {
            if (!menuInputActive) {
                return;
            }
            var level, gameState;
            
            hide();
            level = $(this).data("level");

            gameState = Wolf.Game.startGame(Wolf[activeSkill]);
            Wolf.Game.startLevel(gameState, activeEpisode, level);
        });

    }
    
    function customizeKeys($this) {
        menuInputActive = false;
        
        var current = 0,
            isBinding = false,
            blinkInterval;
        
        function selectKey(index) {
            if (index < 0) index += 4;
            index = index % 4;
            var currentSprite = $("span.active", $this);
            if (currentSprite[0]) {
                setCustomizeKey(
                    currentSprite.data("action"),
                    currentSprite.data("keyIndex"),
                    false
                );
            }
            
            var sprite = $("span.k" + (index+1), $this);
            setCustomizeKey(
                sprite.data("action"),
                sprite.data("keyIndex"),
                true
            );
            current = index;
        }

        function activateKey(index) {
            isBinding = true;
            
            var sprite = $("span.k" + (index+1), $this),
                blink = false;
            
            setCustomizeKey(
                sprite.data("action"), "QUESTION", true
            );
            
            if (blinkInterval) {
                clearInterval(blinkInterval);
            }
            blinkInterval = setInterval(function() {
                setCustomizeKey(sprite.data("action"), (blink = !blink) ? "BLANK" : "QUESTION", true);
            }, 500)
        }
        
        function bindKey(index, key) {
            var sprite = $("span.k" + (index+1), $this);
            setCustomizeKey(
                sprite.data("action"),
                key,
                true
            );
            Wolf.Game.bindControl(sprite.data("action"), [key]);
        }
        
        function exitCustomize() {
            $(document).off("keydown", keyHandler);
            initCustomizeMenu();
            menuInputActive = true;
        }
        
        function keyHandler(e) {
            var i;
            if (isBinding) {
                // look for key in bindable key codes. TODO: LUT?
                for (i=2;i<keySpriteNames.length;i++) {
                    if (Wolf.Keys[keySpriteNames[i]] == e.which) {
                        bindKey(current, keySpriteNames[i]);
                        isBinding = false;
                        clearInterval(blinkInterval);
                        blinkInterval = 0;
                        break;
                    }
                }
                return;
            }
            
            switch (e.which) {
                case 39: // right
                    selectKey(current + 1);
                    break;
                case 37: // left
                    selectKey(current - 1);
                    break;
                case 13: // enter
                    activateKey(current);
                    break;
                case 27: // ESC
                case 38: // up
                case 40: // down
                    exitCustomize()
                    break;
            }
        }
        $(document).on("keydown", keyHandler);

        
        selectKey(current);
    }
    
    function setCustomizeKey(action, keyIndex, active) {
        var menu = $("#menu div.menu.customize"),
            x = (active ? -256 : 0),
            y = -keySprites[keyIndex] * 32;
        $("span." + action, menu)
            .css(
                "backgroundPosition", x + "px " + y + "px"
            )
            .data("keyIndex", keyIndex)
            .toggleClass("active", !!active);
    }
    
    function initCustomizeMenu() {
        var controls = Wolf.Game.getControls(),
            keys = ["run", "use", "attack", "strafe", "left", "right", "up", "down"],
            i;

        for (i=0;i<keys.length;i++) {
            setCustomizeKey(keys[i], controls[keys[i]][0])
        }
    }

    function initSoundMenu() {
        // Set the sliders to the initial volumes
        $('#slidereffects').val(Wolf.Sound.getFxVolume()).trigger('input');
        $('#slidermusic').val(Wolf.Sound.getMusicVolume()).trigger('input');
     }
    function showMessage(name, blink, onclose) {
        var box, 
            blinkOn = false;
        
        menuInputActive = false;
        
        if (messageBlink) {
            clearInterval(messageBlink);
            messageBlink = 0;
        }
        
        $("#menu .message." + name).show();
        
        box = $("#menu .message." + name + " div.box");
        
        box.removeClass("blink");
        
        if (blink) {
            setInterval(function() {
                blinkOn = !blinkOn;
                if (blinkOn) {
                    box.addClass("blink");
                } else {
                    box.removeClass("blink");
                }
            }, 200);
        }
        
        function close(value) {
            playSound("lsfx/039.ogg");
            $(document).off("keydown", keyHandler);
            $("#menu .message." + name).hide();
            if (messageBlink) {
                clearInterval(messageBlink);
                messageBlink = 0;
            }
            menuInputActive = true;
            
            if (onclose) {
                onclose(value)
            }
        }
        
        
        function keyHandler(e) {
            switch (e.which) {
                case 27: // ESC
                case 78: // N
                    close(false);
                    break;
                case 89: // Y
                    close(true);
                    break;
            }
        }

        $(document).on("keydown", keyHandler);
       
    }

    
    /** 
     * @description Show the menu
     * @memberOf Wolf.Menu
     */
    function show(menuName) {
        var mouseOn;
        
        if (!setupDone) {
            setupEvents();
            setupDone = true;
        }
        
        menuName = menuName || "main";

        if (menuName == "main") {
            if (Wolf.Game.isPlaying()) {
                $("#menu div.menu.main li.resumegame")
                    .removeClass("hidden")
                    .addClass("active")
                    .show();
                $("#menu div.menu.main li").first()
                    .removeClass("active")
            } else {
                $("#menu div.menu.main li.resumegame")
                    .addClass("hidden")
                    .hide();
            }
        }

        else {
            Wolf.Sound.startMusic("music/WONDERIN.ogg"); // Ensure user has interacter with the page
            if (menuName == "customize") {
                initCustomizeMenu();
            }

            else if (menuName == "sound") {
                initSoundMenu();
            }


            else if (menuName == "episodes") {
                $("#menu div.menu.episodes li")
                    .removeClass("hidden")
                    .show();

                if (!Wolf.Episodes[0].enabled) {
                    $("#menu div.menu.episodes li.episode-0")
                        .addClass("hidden")
                        .hide();
                }
                if (!Wolf.Episodes[1].enabled) {
                    $("#menu div.menu.episodes li.episode-1")
                        .addClass("hidden")
                        .hide();
                }
                if (!Wolf.Episodes[2].enabled) {
                    $("#menu div.menu.episodes li.episode-2")
                        .addClass("hidden")
                        .hide();
                }
            }

            else if (menuName == "control") {
                $("#menu li.mouseenabled div.light").toggleClass("on", Wolf.Game.isMouseEnabled());
            }

            else if (menuName == "other") {
                $("#menu li.showtiming div.light").toggleClass("on", Wolf.Game.getShowTiming());
                $("#menu li.showLog div.light").toggleClass("on", Wolf.Game.getShowLog());
            }
        }
        
        if ($("#menu").data("menu")) {
            $("#menu").removeClass($("#menu").data("menu"));
        }
        $("#menu div.menu").removeClass("active").hide();
        $("#menu").data("menu", menuName).addClass(menuName).show();
        $("#menu div.menu." + menuName).addClass("active").show();
      
        activeMenu = $("#menu div.menu." + menuName);
        var activeItem = activeMenu.find("li.active:not(.hidden)").first();

        if (activeItem.length === 0) {
            activeItem = activeMenu.find("li").first();
        }

        setActiveItem(activeItem);
        $("#menu").focus();
        
        menuInputActive = true;
    }
    
    /** 
     * @description Hide the menu
     * @memberOf Wolf.Menu
     */
    function hide() {
        $("#menu").hide();
        menuInputActive = false;
    }
    
    function showText(name, num, closeFunction) {
        var screen = $("#text-screen"),
            current = 0;
            
        menuInputActive = false;            

        function show(moveIdx) {
            current += moveIdx;
            if (current < 0) {
                current += num;
            }
            current = current % num;
            screen.css({
                "backgroundImage" : "url(art/text-screens/" + name + "-" + (current+1) + ".png)"
            });
            // preload the next in the background
            var next = (current + 1) % num,
                nextImg = new Image();
            nextImg.src = "art/text-screens/" + name + "-" + (next+1) + ".png";
        }
        function close() {
            $(document).off("keydown", keyHandler);
            screen.fadeOut(null, closeFunction);
            menuInputActive = true;
        }
        
        function keyHandler(e) {
            switch (e.which) {
                case 39: // right
                    show(1);
                    break;
                case 37: // left
                    show(-1);
                    break;
                case 27: // ESC
                    close();
                    break;
            }
        }
        show(0);
        
        screen.fadeIn(null, function() {
            $(document).on("keydown", keyHandler);
        });
    }

    return {
        show : show,
        hide : hide,
        showText : showText
    };

})();
