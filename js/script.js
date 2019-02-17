angular.module('words_app', []).controller('words_controller', function() {

  // INIT
  var app = this;
  app.util = { /* Util methods, not related directly to app settings */ };
  app.game = { /* Methods and settings for this app */ };


  // UTIL methods and settings
  app.util.is_debug_mode = false;
  app.util.MAX_NUMBER_TRIES = 1000;

  app.util.to_unique = function(list) {
    // Return unique elements from a given list.
    function only_unique_filter(value, index, self) {
      return self.indexOf(value) === index;
    }
    return list.filter(only_unique_filter);
  }

  app.util.generate_random_letter = function() {
    // Return a random letter
    return String.fromCharCode(97 + Math.floor(Math.random() * 26)).toUpperCase();
  };

  app.util.generate_random_letters_matrix = function(number_lines, number_columns) {
    // Return a matrix with random letters with given dimensions.
    var matrix = [];
    for(var i = 0; i < number_lines; i++) {
      matrix[i] = [];
      for(var j = 0; j < number_columns; j++) {
        matrix[i][j] = app.util.generate_random_letter();
      }
    }

    return {
      'number_lines': number_lines,
      'number_columns': number_columns,
      'values': matrix
    }
  };


  // GAME methods and settings
  app.game.is_solved = false;
  app.game.is_hint_vissible = false;
  app.game.number_lines = 10;
  app.game.number_columns = 20;
  app.game.used_points = [];

  app.game.words_directions = {
    "W": true,   // left
    "E": true,   // right
    "N": true,   // top
    "S": true,   // bottom
    "NE": true,  // top-right
    "NW": true,  // top-left
    "SE": true,  // bottom-right
    "SW": true,  // bottom-left
  };

  app.game.hidden_words_list = [
    // We save hidden words in this list.
    // Default words are used in example.
    "GO",
    "RED",
    "TRUE",
    "INSIDE",
    "BEAUTIFUL",
    "LEARN",
    "HELPFUL",
    "CONNECT",
    "BRANDING",
    "CONVERSATION",
    "AUTHENTIC",
    "RESPOND"
  ];

  app.game.matrix = app.util.generate_random_letters_matrix(app.game.number_lines, app.game.number_columns);

  app.game.is_used_point = function(line, column) {
    // Search if a given point in matrix is already used by a word letter
    return app.game.used_points.filter(function(point) {
      if(point.line == line && point.column == column) {
        return true;
      }
    }).length !== 0;
  }

  app.game.is_valid_point = function(line, column) {
    // Check if a given point in matrix can be written
    if(line <= 0 || column <= 0 || line >= app.game.matrix.number_lines || column >= app.game.matrix.number_columns) {
      return false;
    }

    if(app.game.is_used_point(line, column)) {
      return false
    }

    return true;
  }

  app.game.list_used_points = function() {
    // Return used points for hidden words in matrix
    var text_result = "";
    app.game.used_points.forEach(function(point) {
      text_result += "(" + point.line.toString() + "," + point.column.toString() + ") ";
    });
    return text_result;
  };

  app.game.get_random_matrix_column = function() {
    // Return a random column in matrix
    return Math.floor(Math.random(app.game.matrix.number_columns) * app.game.matrix.number_columns) - 1;
  };

  app.game.get_random_matrix_line = function() {
    // Return a random line in matrix
    return Math.floor(Math.random(app.game.matrix.number_lines) * app.game.matrix.number_lines) - 1;
  };

  app.game.get_random_matrix_point = function() {
    // Return a random point in matrix
    return {
      'number_column': app.game.get_random_matrix_column(),
      'number_line': app.game.get_random_matrix_line()
    }
  };

  app.game.save_hidden_words_list = function() {
    // Save hidden words from form input.
    var words_textarea = $("#words-textarea");
    hidden_words = words_textarea.val().toUpperCase().split("\n");
    app.game.hidden_words_list = app.util.to_unique(hidden_words);  // Duplicate words are not saved.
  };

  app.game.add_word_to_matrix = function(word) {
    // Add a hidden word in existing game matrix with a random direction existing in game settings.

    var allowed_directions = Object.keys(app.game.words_directions).filter(function(direction) {
      return app.game.words_directions[direction];
    });

    var direction = allowed_directions[Math.floor(Math.random() * allowed_directions.length)];
    var start_point = app.game.get_random_matrix_point();
    var start_line = start_point.number_line;
    var start_column = start_point.number_column;

    // Make the changes in matrix.
    console.log("Adding word: ", direction, word, start_point);
    is_possible = true;

    if(direction == "W") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line;
            if(app.game.matrix.values[line] == undefined) {
              debugger;
            }
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "E") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "N") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var line = start_line; line > start_line - word.length; line--) {
            column = start_column;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var line = start_line; line > start_line - word.length; line--) {
            column = start_column;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "S") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var line = start_line; line < start_line + word.length; line++) {
            column = start_column;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var line = start_line; line < start_line + word.length; line++) {
            column = start_column;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "NE") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line - letter_number;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line - letter_number;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "NW") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line - letter_number;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line - letter_number;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "SE") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line + letter_number;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column < start_column + word.length; column++) {
            line = start_line + letter_number;
            if(app.game.matrix.values[line] == undefined) {
              debugger;
            }
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(direction == "SW") {
      ["read", "write"].forEach(function(mode) {
        if(mode == "read") {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line + letter_number;
            if(!app.game.is_valid_point(line, column)) {
              is_possible = false;
              console.log("Canceled adding word at (", line, ",", column, ").");
            }
            letter_number++;
          }
        }
        if(mode == "write" && is_possible) {
          letter_number = 0;
          for(var column = start_column; column > start_column - word.length; column--) {
            line = start_line + letter_number;
            app.game.matrix.values[line][column] = word[letter_number];
            app.game.used_points.push({"line": line, "column": column});
            letter_number++;
          }
        }
      });
    }

    if(is_possible) {
      return true;
    } else {
      return false;
    }
  };

  app.game.create_game_matrix = function() {
    // Add hidden words to a random matrix of letters.
    app.game.matrix = app.util.generate_random_letters_matrix(app.game.number_lines, app.game.number_columns);
    app.game.hidden_words_list.forEach(
      function(word) {
        for(var tried = 0; tried < app.util.MAX_NUMBER_TRIES; tried++) {
          var done = app.game.add_word_to_matrix(word);
          if(done) {
            break;
          }
        }
        if(!done) {
          console.log("Failed for ", word);
        }
    });
  };

  app.game.generate_game = function() {
    // Generate word search game based on hidden words list.
    app.game.save_hidden_words_list();
    app.game.used_points = [];
    app.game.create_game_matrix();
  };

  app.game.solve_game = function() {
    // Show the hidden words in the game matrix.
    app.game.is_solved = true;
  };

  app.game.unsolve_game = function() {
    // Hide the hidden words in the game matrix.
    app.game.is_solved = false;
  };

  app.game.show_hint = function() {
    // Show the list of hidden words under the game matrix.
    app.game.is_hint_visible = true;
  };

  app.game.hide_hint = function() {
    // Hide the list of hidden words under the game matrix.
    app.game.is_hint_visible = false;
  };

  app.game.print = function() {
    // Print the page
    window.print();
  };

  // INIT
  app.game.create_game_matrix();
});
