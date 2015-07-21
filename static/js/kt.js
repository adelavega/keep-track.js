// Generated by CoffeeScript 1.9.3
(function() {
  var Block, InstGrid, Instruction, PracBlock, Session, Word, all_cats, categories, clearGrid, closeGrid, fillGrid, hideButtons, keyText, real_stim, stim, stimLength,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  hideButtons = function() {
    $("#leftButton").hide();
    return $("#rightButton").hide();
  };

  keyText = function(text, key) {
    if (key === 'left') {
      $("#leftText").html(text);
      return $("#leftButton").show();
    } else {
      $("#rightText").html(text);
      return $("#rightButton").show();
    }
  };

  fillGrid = function(cats) {
    var cat, cdiv, filt, i, j, len, results, x;
    clearGrid();
    $('.btn-group').parent().addClass('hidden');
    $('#responses').show().removeClass('hidden');
    i = 1;
    results = [];
    for (j = 0, len = cats.length; j < len; j++) {
      cat = cats[j];
      cdiv = "#c" + i.toString();
      filt = cdiv + ' > button';
      $(cdiv).parent().removeClass('hidden');
      $(cdiv).prev().html(cat + "&nbsp&nbsp");
      x = 0;
      $(filt).each(function() {
        $(this).html(categories[cat][x]);
        return x = x + 1;
      });
      results.push(i = i + 1);
    }
    return results;
  };

  closeGrid = function(func) {
    $('#responses').fadeOut();
    return setTimeout(((function(_this) {
      return function() {
        return func();
      };
    })(this)), 500);
  };

  clearGrid = function() {
    return $('.resp').removeClass('btn-primary');
  };

  stim = {
    "pracLists": [[["Animals"], ["Cat"], ["Horse", "Mile", "Steel", "Cat", "Green", "Aunt"]], [["Metals", "Countries"], ["Steel", "Mexico"], ["Red", "Blue", "Tin", "Cow", "Yellow", "England", "Lion", "Meter", "Inch", "Mexico", "Black", "Brother", "Green", "Cat", "Yard", "Aunt", "Uncle", "Steel", "Horse", "Father"]]]
  };

  real_stim = [[["Distances", "Animals", "Countries"], ["Mile", "Cat", "France"], ["Father", "Mexico", "Tin", "Germany", "Platinum", "Green", "Orange", "Tiger", "Mile", "Blue", "Steel", "Cat", "France", "Black", "Aunt"]], [["Colors", "Metals", "Relatives", "Distances"], ["Blue", "Tin", "Brother", "Meter"], ["Horse", "Russia", "Mexico", "Zinc", "Father", "Canada", "Lion", "France", "Sister", "England", "Brother", "Tin", "Meter", "Blue", "Tiger"]], [["Animals", "Countries", "Colors", "Metals", "Relatives"], ["Horse", "Russia", "Orange", "Copper", "Mother"], ["Canada", "Russia", "Steel", "Platinum", "Uncle", "Centimeter", "Foot", "Copper", "Meter", "Aunt", "Mother", "Yellow", "Horse", "Orange", "Mile"]], [["Countries", "Colors", "Metals", "Relatives"], ["Mexico", "Red", "Iron", "Mother"], ["Black", "Mile", "Meter", "Aunt", "Horse", "Mexico", "Steel", "Sister", "Copper", "Red", "Inch", "Dog", "Mother", "Iron", "Foot"]], [["Relatives", "Distances", "Animals", "Countries", "Colors"], ["Uncle", "Foot", "Cat", "Russia", "Yellow"], ["Germany", "Inch", "Steel", "Blue", "Lion", "Orange", "Zinc", "Yellow", "Cat", "Canada", "Foot", "Russia", "Copper", "Uncle", "Tin"]], [["Metals", "Relatives", "Distances", "Animals"], ["Platinum", "Father", "Mile", "Cow"], ["Platinum", "Centimeter", "Yard", "France", "Mile", "Horse", "Brother", "Red", "Yellow", "Blue", "Father", "Tiger", "Cow", "Green", "Russia"]], [["Distances", "Animals", "Countries", "Colors", "Metals"], ["Yard", "Dog", "England", "Red", "Zinc"], ["Yard", "France", "Iron", "Black", "Green", "Red", "Tin", "Cow", "Brother", "Aunt", "Dog", "Zinc", "England", "Sister", "Uncle"]]];

  categories = {
    "Animals": ["Dog", "Cat", "Tiger", "Horse", "Lion", "Cow"],
    "Relatives": ["Sister", "Mother", "Brother", "Aunt", "Father", "Uncle"],
    "Distances": ["Mile", "Centimeter", "Inch", "Foot", "Meter", "Yard"],
    "Countries": ["Germany", "Russia", "Canada", "France", "England", "Mexico"],
    "Metals": ["Zinc", "Tin", "Steel", "Iron", "Copper", "Platinum"],
    "Colors": ["Red", "Green", "Blue", "Yellow", "Black", "Orange"]
  };

  all_cats = ['Distances', 'Relatives', 'Animals', 'Countries', 'Metals', 'Colors'];

  stimLength = 2000;

  Session = (function() {
    function Session(blocks) {
      this.blocks = blocks;
      hideButtons();
      this.blockNumber = 0;
      this.max_blocks = this.blocks.length;
      this.imgs_loaded = 0;
    }

    Session.prototype.start = function() {
      psiTurk.finishInstructions();
      this.imgs_loaded++;
      if (this.imgs_loaded === 2) {
        return this.nextBlock();
      }
    };

    Session.prototype.nextBlock = function() {
      this.currBlock = this.blocks[this.blockNumber];
      if (this.blockNumber >= this.max_blocks) {
        return this.endSession();
      } else {
        this.blockNumber++;
        $('.tasktext').html(' ');
        return this.currBlock.start(((function(_this) {
          return function(arg1) {
            return _this.exitBlock(arg1);
          };
        })(this)));
      }
    };

    Session.prototype.prevBlock = function() {
      if (this.blockNumber > 1) {
        this.blockNumber = this.blockNumber - 2;
      }
      this.currBlock = this.blocks[this.blockNumber];
      this.blockNumber++;
      return this.currBlock.start(((function(_this) {
        return function(arg1) {
          return _this.exitBlock(arg1);
        };
      })(this)));
    };

    Session.prototype.exitBlock = function(next) {
      if (next == null) {
        next = true;
      }
      psiTurk.saveData();
      if (next) {
        return this.nextBlock();
      } else {
        return this.prevBlock();
      }
    };

    Session.prototype.endSession = function() {
      return psiTurk.completeHIT();
    };

    Session.prototype.buttonClick = function(e) {
      return this.currBlock.buttonClick(e);
    };

    return Session;

  })();

  Instruction = (function() {
    function Instruction(message, leftKey, rightKey, corrResp) {
      this.message = message;
      this.leftKey = leftKey != null ? leftKey : null;
      this.rightKey = rightKey != null ? rightKey : "Continue";
      this.corrResp = corrResp != null ? corrResp : null;
    }

    Instruction.prototype.start = function(exitTrial) {
      this.exitTrial = exitTrial;
      this.startTime = (new Date).getTime();
      $('#inst').html(this.message);
      $('#inst').show();
      hideButtons();
      if (this.leftKey != null) {
        keyText(this.leftKey, 'left');
      }
      return keyText(this.rightKey, 'right');
    };

    Instruction.prototype.buttonClick = function(button) {
      var acc, rt;
      rt = (new Date).getTime() - this.startTime;
      if (this.corrResp != null) {
        if (this.corrResp === button) {
          $('#correct').modal('show');
          setTimeout(((function(_this) {
            return function() {
              return $('#correct').modal('hide');
            };
          })(this)), 1250);
          setTimeout(((function(_this) {
            return function() {
              return _this.exitTrial();
            };
          })(this)), 1250);
          acc = 1;
        } else {
          $('#error').modal('show');
          setTimeout(((function(_this) {
            return function() {
              return $('#error').modal('hide');
            };
          })(this)), 1250);
          acc = 0;
        }
      } else {
        if (button.id === 'leftText' || button.id === 'leftButton') {
          acc = 'BACK';
          this.exitTrial(false);
        } else if (button.id === 'rightText' || button.id === 'rightButton') {
          acc = 'FORWARD';
          this.exitTrial();
        }
      }
      return psiTurk.recordTrialData({
        'block': this.message,
        'rt': rt,
        'resp': button,
        'acc': acc
      });
    };

    return Instruction;

  })();

  InstGrid = (function() {
    function InstGrid(message, categories1, disabled, correct, leftKey, rightKey) {
      this.message = message;
      this.categories = categories1 != null ? categories1 : all_cats;
      this.disabled = disabled != null ? disabled : true;
      this.correct = correct != null ? correct : false;
      this.leftKey = leftKey != null ? leftKey : "Back";
      this.rightKey = rightKey != null ? rightKey : "Continue";
      this.maxClicks = this.correct.length;
      this.nClicks = 0;
      this.triesBeforeHint = 2;
    }

    InstGrid.prototype.start = function(exitTrial) {
      this.exitTrial = exitTrial;
      fillGrid(this.categories);
      $('#inst').html(this.message);
      $('#inst').show();
      hideButtons();
      if (this.leftKey) {
        keyText(this.leftKey, 'left');
      }
      if (this.rightKey) {
        keyText(this.rightKey, 'right');
      }
      if (this.correct !== false) {
        keyText('Submit', 'right');
        $('#rightButton').addClass('disabled');
        return $('#rightButton').removeClass('btn-success');
      }
    };

    InstGrid.prototype.reset = function() {
      return clearGrid();
    };

    InstGrid.prototype.buttonClick = function(button) {
      if (button.id === 'leftText' || button.id === 'leftButton') {
        return closeGrid(this.exitTrial(false));
      } else if (button.id === 'rightText' || button.id === 'rightButton') {
        if (!this.correct) {
          return closeGrid(this.exitTrial);
        } else {
          return this.checkResponses();
        }
      } else {
        if (!this.disabled) {
          $(button).siblings().removeClass('btn-primary');
          $(button).toggleClass('btn-primary');
          if ($('.resp.btn-primary').length === this.maxClicks) {
            $('#rightButton').removeClass('disabled');
            return $('#rightButton').addClass('btn-success');
          } else if ($('.resp.btn-primary').length !== this.maxClicks) {
            $('#rightButton').addClass('disabled');
            return $('#rightButton').removeClass('btn-success');
          }
        }
      }
    };

    InstGrid.prototype.checkResponses = function() {
      var allCorr, j, len, resp, responses;
      this.nClicks += 1;
      responses = $('.resp.btn-primary').map(function() {
        return $(this).text();
      }).get();
      allCorr = true;
      for (j = 0, len = responses.length; j < len; j++) {
        resp = responses[j];
        if (indexOf.call(this.correct, resp) >= 0 === false) {
          allCorr = false;
        }
      }
      if (allCorr) {
        closeGrid(this.exitTrial);
        $('#correct').modal('show');
        $('#errortext').html("Try again");
        return setTimeout(((function(_this) {
          return function() {
            return $('#correct').modal('hide');
          };
        })(this)), 1250);
      } else {
        return this.showError();
      }
    };

    InstGrid.prototype.showError = function() {
      if (this.nClicks >= this.triesBeforeHint) {
        $('#errortext').html("The correct words are " + this.correct.join(', '));
      }
      $('#error').modal('show');
      return setTimeout(((function(_this) {
        return function() {
          return $('#error').modal('hide');
        };
      })(this)), 1500);
    };

    return InstGrid;

  })();

  Block = (function() {
    function Block(condition, message, trial_structure) {
      var cat, upper_cats, word;
      this.condition = condition;
      this.message = message;
      this.trialNumber = 0;
      this.categories = trial_structure[0];
      this.target_words = trial_structure[1];
      this.words = (function() {
        var j, len, ref, results;
        ref = trial_structure[2];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          word = ref[j];
          results.push(new Word(word, 2000));
        }
        return results;
      })();
      this.max_trials = this.words.length;
      upper_cats = [
        (function() {
          var j, len, ref, results;
          ref = this.categories;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            cat = ref[j];
            results.push(cat.toUpperCase());
          }
          return results;
        }).call(this)
      ];
      this.catText = upper_cats[0].join("&nbsp&nbsp");
      console.log(this.categories);
    }

    Block.prototype.start = function(exitBlock) {
      this.exitBlock = exitBlock;
      hideButtons();
      $('#topText').html(this.message);
      return setTimeout(((function(_this) {
        return function() {
          $('#topText').html(" ");
          $('#bottomText').html(_this.catText);
          return setTimeout((function() {
            return _this.nextTrial();
          }), stimLength);
        };
      })(this)), stimLength * 2);
    };

    Block.prototype.nextTrial = function() {
      this.currTrial = this.words[this.trialNumber];
      if (this.trialNumber >= this.max_trials) {
        this.trialNumber++;
        return this.getResponses();
      } else {
        this.trialNumber++;
        return this.currTrial.show(((function(_this) {
          return function() {
            return _this.nextTrial();
          };
        })(this)));
      }
    };

    Block.prototype.getResponses = function() {
      $('#bottomText').html(" ");
      $('#topText').html(" ");
      $('#inst').html("Please enter the last word of each category");
      keyText('Submit', 'right');
      fillGrid(this.categories);
      this.maxClicks = this.categories.length;
      $('#rightButton').addClass('disabled');
      return $('#rightButton').removeClass('btn-success');
    };

    Block.prototype.buttonClick = function(button) {
      var responses;
      if (button.id === 'rightText' || button.id === 'rightButton') {
        responses = $('.resp.btn-primary').map(function() {
          return $(this).text();
        }).get();
        console.log({
          'block': this.condition,
          'target_words': this.target_words,
          'input_words': responses
        });
        closeGrid(this.exitBlock);
        return psiTurk.recordTrialData({
          'block': this.condition,
          'target_words': this.target_words,
          'input_words': responses
        });
      } else {
        $(button).siblings().removeClass('btn-primary');
        $(button).toggleClass('btn-primary');
        if ($('.resp.btn-primary').length === this.maxClicks) {
          $('#rightButton').removeClass('disabled');
          return $('#rightButton').addClass('btn-success');
        } else if ($('.resp.btn-primary').length !== this.maxClicks) {
          $('#rightButton').addClass('disabled');
          return $('#rightButton').removeClass('btn-success');
        }
      }
    };

    return Block;

  })();

  PracBlock = (function(superClass) {
    extend(PracBlock, superClass);

    function PracBlock(condition, message, trial_structure, speed) {
      var word;
      this.condition = condition;
      this.message = message;
      if (speed == null) {
        speed = 3500;
      }
      PracBlock.__super__.constructor.call(this, this.condition, this.message, trial_structure);
      this.words = (function() {
        var j, len, ref, results;
        ref = trial_structure[2];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          word = ref[j];
          results.push(new Word(word, speed));
        }
        return results;
      })();
    }

    PracBlock.prototype.getResponses = function() {
      $('#bottomText').html(" ");
      $('#topText').html(" ");
      return this.exitBlock();
    };

    return PracBlock;

  })(Block);

  Word = (function() {
    function Word(word1, stimLength1) {
      this.word = word1;
      this.stimLength = stimLength1 != null ? stimLength1 : stimLength;
    }

    Word.prototype.show = function(exitTrial) {
      this.exitTrial = exitTrial;
      $('#topText').html(this.word);
      return setTimeout(((function(_this) {
        return function() {
          return _this.exitTrial();
        };
      })(this)), this.stimLength);
    };

    return Word;

  })();

  this.kTrack = {
    Session: Session,
    InstGrid: InstGrid,
    Block: Block,
    PracBlock: PracBlock,
    Word: Word,
    Instruction: Instruction,
    stim: stim,
    all_cats: all_cats,
    real_stim: real_stim
  };

}).call(this);
