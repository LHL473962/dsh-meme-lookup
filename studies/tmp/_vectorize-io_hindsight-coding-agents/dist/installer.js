#!/usr/bin/env node

// src/installer.ts
import { execFileSync as execFileSync8 } from "child_process";
import {
  copyFileSync,
  cpSync as cpSync2,
  existsSync as existsSync13,
  mkdirSync as mkdirSync7,
  mkdtempSync as mkdtempSync2,
  readFileSync as readFileSync15,
  readSync as readSync4,
  realpathSync as realpathSync3,
  rmSync as rmSync4,
  writeFileSync as writeFileSync5
} from "fs";
import { homedir as homedir13, tmpdir as tmpdir5 } from "os";
import { isatty } from "tty";
import { dirname as dirname13, join as join24 } from "path";
import { fileURLToPath as fileURLToPath7, pathToFileURL } from "url";

// node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      // strings
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};
var supportedEols = ["\n", "\r", "\r\n"];

// node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = "	";
  }
  const indentType = indentValue === "	" ? "	" : " ";
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (!hasError && (!range || startOffset < rangeEnd && endOffset > rangeStart) && documentText.substring(startOffset, endOffset) !== text) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent = indentValue.length * initialIndentLevel < 20 && options.insertSpaces ? cachedSpaces[indentValue.length * initialIndentLevel] : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = "";
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : "";
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content.length) {
    let ch = content.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === "	") {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\r") {
      if (i + 1 < text.length && text.charAt(i + 1) === "\n") {
        return "\r\n";
      }
      return "\r";
    } else if (ch === "\n") {
      return "\n";
    }
  }
  return options && options.eol || "\n";
}
function isEOL(text, offset) {
  return "\r\n".indexOf(text.charAt(offset)) !== -1;
}

// node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep2, offset, length) => {
      if (currentParent.type === "property") {
        if (sep2 === ":") {
          currentParent.colonOffset = offset;
        } else if (sep2 === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (let segment of path) {
    if (typeof segment === "string") {
      if (node.type !== "object" || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment && propertyNode.children.length === 2) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index = segment;
      if (node.type !== "array" || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
        return void 0;
      }
      node = node.children[index];
    }
  }
  return node;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString2(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString2(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray2() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray2();
      case 1:
        return parseObject();
      case 10:
        return parseString2(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function getNodeType(value) {
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value) {
        return "null";
      } else if (Array.isArray(value)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}

// node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path = originalPath.slice();
  const errors = [];
  const root = parseTree(text, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path.length > 0) {
    lastSegment = path.pop();
    parent = findNodeAtLocation(root, path);
    if (parent === void 0 && value !== void 0) {
      if (typeof lastSegment === "string") {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === void 0) {
      throw new Error("Can not delete in empty document");
    }
    return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value === void 0) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, options);
      } else {
        return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
      }
    } else {
      if (value === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text, edit, options);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === void 0 && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text, edit, options);
    } else if (value !== void 0) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(`Can not ${value === void 0 ? "remove" : options.isArrayInsertion ? "insert" : "modify"} Array index ${insertIndex} as length is not sufficient`);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(newText, { offset: begin, length: end - begin }, { ...options.formattingOptions, keepLines: false });
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}

// node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function modify(text, path, value, options) {
  return setProperty(text, path, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1; i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}

// node_modules/smol-toml/dist/error.js
function getLineColFromPtr(string, ptr) {
  let lines = string.slice(0, ptr).split(/\r?\n/);
  return [lines.length, lines.pop().length + 1];
}
function makeCodeBlock(string, line, column) {
  let lines = string.split(/\r?\n/);
  let codeblock = "";
  let numberLen = (Math.log10(line + 1) | 0) + 1;
  for (let i = line - 1; i <= line + 1; i++) {
    let l = lines[i - 1];
    if (!l)
      continue;
    codeblock += i.toString().padEnd(numberLen, " ");
    codeblock += ":  ";
    codeblock += l;
    codeblock += "\n";
    if (i === line) {
      codeblock += " ".repeat(numberLen + column + 2);
      codeblock += "^\n";
    }
  }
  return codeblock;
}
var TomlError = class _TomlError extends Error {
  line;
  column;
  codeblock;
  constructor(message, options) {
    const [line, column] = getLineColFromPtr(options.toml, options.ptr);
    const codeblock = makeCodeBlock(options.toml, line, column);
    super(`Invalid TOML document: ${message}

${codeblock}`, options);
    this.line = line;
    this.column = column;
    this.codeblock = codeblock;
  }
  /** @internal */
  static x(message, ctx, ptr) {
    throw new _TomlError(message, { toml: ctx.s, ptr: ptr ?? ctx.p });
  }
};

// node_modules/smol-toml/dist/primitive.js
function parseString(ctx) {
  let startPtr = ctx.p;
  let c = ctx.s.charCodeAt(ctx.p++);
  let first = c;
  let isLiteral = c === 39;
  let isMultiline = c === ctx.s.charCodeAt(ctx.p) && c === ctx.s.charCodeAt(ctx.p + 1);
  if (isMultiline) {
    if ((c = ctx.s.charCodeAt(ctx.p += 2)) === 10)
      ctx.p++;
    else if (c === 13 && ctx.s.charCodeAt(ctx.p + 1) === 10)
      ctx.p += 2;
  }
  let parsed = "";
  let sliceStart = ctx.p;
  let state = 0;
  for (; ctx.p < ctx.s.length; ctx.p++) {
    c = ctx.s.charCodeAt(ctx.p);
    if (isMultiline && (c === 10 || c === 13 && ctx.s.charCodeAt(ctx.p + 1) === 10)) {
      state = state && 3;
    } else if (c < 32 && c !== 9 || c === 127) {
      TomlError.x("control characters are not allowed in strings", ctx);
    } else if ((!state || state === 3) && c === first && (!isMultiline || ctx.s.charCodeAt(ctx.p + 1) === first && ctx.s.charCodeAt(ctx.p + 2) === first)) {
      if (isMultiline) {
        if (ctx.s.charCodeAt(ctx.p + 3) === first)
          ctx.p++;
        if (ctx.s.charCodeAt(ctx.p + 3) === first)
          ctx.p++;
      }
      if (!state) {
        let s = ctx.s.slice(sliceStart, ctx.p);
        parsed = parsed ? parsed + s : s;
      }
      ctx.p += isMultiline ? 3 : 1;
      return parsed;
    } else if (!state) {
      if (!isLiteral && c === 92) {
        parsed += ctx.s.slice(sliceStart, sliceStart = ctx.p);
        state = 1;
      }
    } else if (state === 1) {
      if (c === 120 || c === 117 || c === 85) {
        let errPtr = ctx.p++ - 1;
        let value = 0;
        let len = c === 120 ? 2 : c === 117 ? 4 : 8;
        for (let j = 0; j < len; j++, ctx.p++) {
          let hex = ctx.s.charCodeAt(ctx.p);
          let digit = (
            /* 0-9 */
            hex >= 48 && hex <= 57 ? hex - 48 : (
              /* A-F */
              hex >= 65 && hex <= 70 ? hex - 65 + 10 : (
                /* a-f */
                hex >= 97 && hex <= 102 ? hex - 97 + 10 : -1
              )
            )
          );
          if (digit < 0)
            TomlError.x("invalid non-hex character in unicode escape", ctx);
          value = value << 4 | digit;
        }
        if (value < 0 || value > 1114111 || value >= 55296 && value <= 57343) {
          TomlError.x("invalid unicode escape", ctx, errPtr);
        }
        parsed += String.fromCodePoint(value);
        sliceStart = ctx.p--;
        state = 0;
      } else if (isMultiline && (c === 32 || c === 9)) {
        state = 2;
      } else {
        if (c === 98)
          parsed += "\b";
        else if (c === 116)
          parsed += "	";
        else if (c === 110)
          parsed += "\n";
        else if (c === 102)
          parsed += "\f";
        else if (c === 114)
          parsed += "\r";
        else if (c === 101)
          parsed += "\x1B";
        else if (c === 34)
          parsed += '"';
        else if (c === 92)
          parsed += "\\";
        else
          TomlError.x("unrecognised escape sequence", ctx);
        sliceStart = ctx.p + 1;
        state = 0;
      }
    } else if (c !== 32 && c !== 9) {
      if (state === 2)
        TomlError.x("invalid escape: only line-ending whitespace may be escaped", ctx, sliceStart);
      state = !isLiteral && c === 92 ? 1 : 0;
      sliceStart = ctx.p;
    }
  }
  TomlError.x("unfinished string", ctx, startPtr);
}

// node_modules/smol-toml/dist/date.js
var DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})?[Tt ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|z|[-+]\d{2}:\d{2})?$/i;
var TomlDate = class _TomlDate extends Date {
  #hasDate = false;
  #hasTime = false;
  #offset = null;
  constructor(date, fasttype, unsafeDelim) {
    let hasDate = true;
    let hasTime = true;
    let offset = "Z";
    let c;
    if (typeof date === "string") {
      if (fasttype)
        prep: {
          if (fasttype < 3) {
            if (+date.slice(11, 13) > 23) {
              date = "";
              break prep;
            }
            if (fasttype === 2) {
              offset = null;
              date += "Z";
            } else if ((c = date.charCodeAt(date.length - 1)) !== 90 && c !== 122) {
              offset = date.slice(date.length - 6);
            }
            if (unsafeDelim)
              date = date.slice(0, 10) + "T" + date.slice(11);
          } else if (fasttype === 4) {
            date = +date.slice(0, 2) > 23 ? "" : `0000-01-01T${date}Z`;
          }
          hasDate = fasttype !== 4;
          hasTime = fasttype !== 3;
        }
      else {
        let match = date.match(DATE_TIME_RE);
        if (match) {
          if (!match[1]) {
            hasDate = false;
            date = `0000-01-01T${date}`;
          }
          hasTime = !!match[2];
          hasTime && date[10] === " " && (date = date.replace(" ", "T"));
          if (match[2] && +match[2] > 23) {
            date = "";
          } else {
            offset = match[3] || null;
            if (!offset && hasTime)
              date += "Z";
          }
        } else {
          date = "";
        }
      }
    }
    super(date);
    if (!isNaN(this.getTime())) {
      this.#hasDate = hasDate;
      this.#hasTime = hasTime;
      this.#offset = offset;
    }
  }
  isDateTime() {
    return this.#hasDate && this.#hasTime;
  }
  isLocal() {
    return !this.#hasDate || !this.#hasTime || !this.#offset;
  }
  isDate() {
    return this.#hasDate && !this.#hasTime;
  }
  isTime() {
    return this.#hasTime && !this.#hasDate;
  }
  isValid() {
    return this.#hasDate || this.#hasTime;
  }
  toISOString() {
    let iso = super.toISOString();
    if (this.isDate())
      return iso.slice(0, 10);
    if (this.isTime())
      return iso.slice(11, 23);
    if (this.#offset === null)
      return iso.slice(0, -1);
    if (this.#offset === "Z" || this.#offset === "z")
      return iso;
    let offset = +this.#offset.slice(1, 3) * 60 + +this.#offset.slice(4, 6);
    offset = this.#offset[0] === "-" ? offset : -offset;
    let offsetDate = new Date(this.getTime() - offset * 6e4);
    return offsetDate.toISOString().slice(0, -1) + this.#offset;
  }
  static wrapAsOffsetDateTime(jsDate, offset = "Z") {
    let date = new _TomlDate(jsDate);
    date.#offset = offset;
    return date;
  }
  static wrapAsLocalDateTime(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#offset = null;
    return date;
  }
  static wrapAsLocalDate(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#hasTime = false;
    date.#offset = null;
    return date;
  }
  static wrapAsLocalTime(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#hasDate = false;
    date.#offset = null;
    return date;
  }
};

// node_modules/smol-toml/dist/extract.js
function isDigit2(char, base = 10) {
  return base === 16 ? char > 47 && char < 58 || char > 64 && char < 71 || char > 96 && char < 103 : char > 47 && char < 48 + base;
}
function isEndOfValue(char, delim) {
  return char === 32 || char === 9 || char === 10 || char === 13 || // Structure end or next value delimiter
  delim && (char === delim || char === 44) || // Comment
  char === 35;
}
function extractValue(ctx, end) {
  let errPtr = ctx.p;
  let c = ctx.s.charCodeAt(ctx.p);
  if (c === 91 || c === 123) {
    ctx.d-- || TomlError.x("document contains excessively nested structures. aborting.", ctx);
    let value = c === 91 ? parseArray(ctx) : parseInlineTable(ctx);
    ctx.d++;
    return value;
  }
  if (c === 34 || c === 39) {
    return parseString(ctx);
  }
  if (c === 116) {
    if (ctx.s.charCodeAt(++ctx.p) !== 114 || ctx.s.charCodeAt(++ctx.p) !== 117 || ctx.s.charCodeAt(++ctx.p) !== 101)
      TomlError.x("invalid value", ctx, errPtr);
    return ctx.p++, true;
  }
  if (c === 102) {
    if (ctx.s.charCodeAt(++ctx.p) !== 97 || ctx.s.charCodeAt(++ctx.p) !== 108 || ctx.s.charCodeAt(++ctx.p) !== 115 || ctx.s.charCodeAt(++ctx.p) !== 101)
      TomlError.x("invalid value", ctx, errPtr);
    return ctx.p++, false;
  }
  if (c === 43 || c === 45) {
    return parseNumber(ctx, ctx.p, ctx.s.charCodeAt(++ctx.p), 44 - c, end);
  }
  if (ctx.s.charCodeAt(ctx.p + 4) === 45 && ctx.s.charCodeAt(ctx.p + 7) === 45) {
    return parseDate(ctx, c, end);
  }
  if (ctx.s.charCodeAt(ctx.p + 2) === 58) {
    return parseTime(ctx, c, end);
  }
  return parseNumber(ctx, ctx.p, c, 0, end);
}
function parseNumber(ctx, startPtr, startChr, sign, endChr) {
  let c = startChr;
  let state = 0;
  let hasUnderscores = false;
  if (c === 105) {
    if (ctx.s.charCodeAt(++ctx.p) !== 110 || ctx.s.charCodeAt(++ctx.p) !== 102)
      TomlError.x("invalid value", ctx, startPtr);
    return ctx.p++, (sign || 1) / 0;
  }
  if (c === 110) {
    if (ctx.s.charCodeAt(++ctx.p) !== 97 || ctx.s.charCodeAt(++ctx.p) !== 110)
      TomlError.x("invalid value", ctx, startPtr);
    return ctx.p++, NaN;
  }
  if (c === 48) {
    if (++ctx.p >= ctx.s.length || isEndOfValue(c = ctx.s.charCodeAt(ctx.p), endChr))
      return ctx.bi === true ? 0n : 0;
    if (!sign) {
      if (c === 120)
        return parseIntegerBaseN(ctx, startPtr, 16, endChr);
      else if (c === 98)
        return parseIntegerBaseN(ctx, startPtr, 2, endChr);
      else if (c === 111)
        return parseIntegerBaseN(ctx, startPtr, 8, endChr);
    }
    if (c === 46)
      state = 2;
    else if (c === 101 || c === 69)
      state = 4;
    else
      TomlError.x("illegal leading zero", ctx, startPtr);
  } else if (!isDigit2(c))
    TomlError.x("invalid value", ctx, startPtr);
  while (++ctx.p < ctx.s.length && (c = ctx.s.charCodeAt(ctx.p), !isEndOfValue(c, endChr))) {
    if (!state)
      state = 1;
    if (c === 95) {
      if (!(state & 1))
        TomlError.x("illegal underscore", ctx);
      state += 11;
      hasUnderscores = true;
    } else if (state === 1 && c === 46)
      state = 2;
    else if ((state === 1 || state === 3) && (c === 101 || c === 69))
      state = 4;
    else if (state === 4 && (c === 43 || c === 45)) {
    } else if (!isDigit2(c))
      TomlError.x(`illegal character in numeric literal`, ctx);
    else if (state > 9)
      state -= 11;
    else if (!(state & 1))
      state++;
  }
  if (!state) {
    let val = (startChr - 48) * (sign || 1);
    return ctx.bi === true ? BigInt(val) : val;
  }
  if (!(state & 1))
    TomlError.x("unfinished numeric value", ctx, startPtr);
  let str = ctx.s.slice(startPtr, ctx.p);
  if (hasUnderscores)
    str = str.replaceAll("_", "");
  return state > 1 ? parseFloat(str) : parseInteger(ctx, str, 10, startPtr);
}
function parseIntegerBaseN(ctx, startPtr, base, endChr) {
  let c, underscore = 1;
  while (++ctx.p < ctx.s.length && (c = ctx.s.charCodeAt(ctx.p), !isEndOfValue(c, endChr))) {
    if (c === 95) {
      if (underscore & 1)
        TomlError.x("illegal underscore", ctx);
      underscore = 3;
    } else if (!isDigit2(c, base))
      TomlError.x(`illegal character in numeric literal`, ctx);
    else if (underscore & 1)
      underscore--;
  }
  if (underscore & 1)
    TomlError.x("unfinished numeric value", ctx);
  let str = ctx.s.slice(startPtr + 2, ctx.p);
  if (underscore)
    str = str.replaceAll("_", "");
  return parseInteger(ctx, str, base, startPtr);
}
function parseInteger(ctx, str, base, startPtr) {
  if (ctx.bi !== true)
    int: {
      let val = parseInt(str, base);
      if (!Number.isSafeInteger(val)) {
        if (ctx.bi)
          break int;
        TomlError.x("integer value cannot be represented losslessly", ctx, startPtr);
      }
      return val;
    }
  return base === 10 ? BigInt(str) : BigInt((base === 2 ? "0b" : base === 8 ? "0o" : "0x") + str);
}
function parseDate(ctx, c, endChr) {
  let startPtr = ctx.p++, unsafeSeparator;
  if (!isDigit2(c) || !isDigit2(ctx.s.charCodeAt(ctx.p++)) || !isDigit2(ctx.s.charCodeAt(ctx.p++)) || !isDigit2(ctx.s.charCodeAt(ctx.p++))) {
    return parseNumber(ctx, ctx.p = startPtr, c, 0, endChr);
  }
  ctx.p += 5;
  if (!isDigit2(ctx.s.charCodeAt(ctx.p++)))
    TomlError.x("invalid date-time: date part is malformed", ctx, startPtr);
  if (ctx.p >= ctx.s.length || ((c = ctx.s.charCodeAt(ctx.p)) !== 32 || (unsafeSeparator = true, !isDigit2(ctx.s.charCodeAt(ctx.p + 1)))) && c !== 84 && c !== 116) {
    let t2 = ctx.s.slice(startPtr, ctx.p);
    return readDate(ctx, t2, 3, false, startPtr);
  }
  if (ctx.s.charCodeAt(ctx.p += 3) !== 58)
    TomlError.x("invalid date-time: time part is malformed", ctx, startPtr);
  if (ctx.s.charCodeAt(ctx.p += 3) === 58)
    ctx.p += 3;
  if (ctx.s.charCodeAt(ctx.p) === 46)
    while (isDigit2(ctx.s.charCodeAt(++ctx.p)))
      ;
  if (c = ctx.s.charCodeAt(ctx.p)) {
    if (c === 90 || c === 122) {
      let t2 = ctx.s.slice(startPtr, ++ctx.p);
      return readDate(ctx, t2, 1, unsafeSeparator, startPtr, "[+00:00]");
    }
    if (c === 43 || c === 45) {
      let t2 = ctx.s.slice(startPtr, ctx.p += 6);
      return readDate(ctx, t2, 1, unsafeSeparator, startPtr, !ctx.ld && "[" + ctx.s.slice(ctx.p - 6, ctx.p) + "]");
    }
  }
  let t = ctx.s.slice(startPtr, ctx.p);
  return readDate(ctx, t, 2, unsafeSeparator, startPtr);
}
function parseTime(ctx, c, endChr) {
  let start = ctx.p;
  if (!isDigit2(c) || !isDigit2(ctx.s.charCodeAt(++ctx.p))) {
    return parseNumber(ctx, --ctx.p, c, 0, endChr);
  }
  if (ctx.s.charCodeAt(ctx.p += 4) === 58)
    ctx.p += 3;
  if (ctx.s.charCodeAt(ctx.p) === 46)
    while (isDigit2(ctx.s.charCodeAt(++ctx.p)))
      ;
  let t = ctx.s.slice(start, ctx.p);
  return readDate(ctx, t, 4, false, start);
}
function readDate(ctx, str, type, unsafeDelim, errPtr, temporalSuffix) {
  if (ctx.ld) {
    let date = new TomlDate(str, type, unsafeDelim);
    if (!date.isValid())
      TomlError.x("invalid date", ctx, errPtr);
    return date;
  }
  try {
    if (temporalSuffix)
      str += temporalSuffix;
    switch (type) {
      case 1:
        return Temporal.ZonedDateTime.from(str);
      case 2:
        return Temporal.PlainDateTime.from(str);
      case 3:
        return Temporal.PlainDate.from(str);
      case 4:
        return Temporal.PlainTime.from(str);
    }
  } catch (e) {
    TomlError.x(e instanceof Error ? e.message : "" + e, ctx, errPtr);
  }
}

// node_modules/smol-toml/dist/util.js
function skipComment(ctx) {
  for (; ctx.p < ctx.s.length; ctx.p++) {
    let c = ctx.s.charCodeAt(ctx.p);
    if (c === 10)
      break;
    if (c === 13 && ctx.s.charCodeAt(ctx.p + 1) === 10) {
      ctx.p++;
      break;
    }
    if (c < 32 && c !== 9 || c === 127) {
      TomlError.x("control characters are not allowed in comments", ctx);
    }
  }
}
function skipVoid(ctx, banNewLines, banComments) {
  let c;
  while (ctx.p < ctx.s.length) {
    while (ctx.p < ctx.s.length && ((c = ctx.s.charCodeAt(ctx.p)) === 32 || c === 9 || !banNewLines && (c === 10 || c === 13 && ctx.s.charCodeAt(ctx.p + 1) === 10)))
      ctx.p++;
    if (banComments || c !== 35)
      break;
    skipComment(ctx);
  }
}

// node_modules/smol-toml/dist/struct.js
function parseKey(ctx, end = 61) {
  let startPtr;
  let state = 0;
  let parsed = [];
  let sliceStart;
  let c = ctx.s.charCodeAt(startPtr = ctx.p);
  do {
    if (c === end) {
      if (!state)
        TomlError.x("unexpected end of key", ctx);
      if (state === 1)
        parsed.push(ctx.s.slice(sliceStart, ctx.p));
      return ctx.p++, parsed;
    } else if (c === 46) {
      if (!state)
        TomlError.x("illegal empty bare key", ctx);
      if (state === 1)
        parsed.push(ctx.s.slice(sliceStart, ctx.p));
      state = 0;
    } else if (!state && (c === 34 || c === 39)) {
      if (c === ctx.s.charCodeAt(ctx.p + 1) && c === ctx.s.charCodeAt(ctx.p + 2))
        TomlError.x("illegal quoted key: multiline strings are not allowed", ctx);
      parsed.push(parseString(ctx));
      state = 2;
      ctx.p--;
    } else if (c === 32 || c === 9) {
      if (state === 1) {
        parsed.push(ctx.s.slice(sliceStart, ctx.p));
        state = 2;
      }
    } else if (state === 2 || c < 48 && c !== 45 || c > 57 && c < 65 || c > 90 && c < 97 && c !== 95 || c > 122) {
      TomlError.x("illegal character in key", ctx);
    } else if (!state) {
      state = 1;
      sliceStart = ctx.p;
    }
  } while (c = ctx.s.charCodeAt(++ctx.p));
  TomlError.x("incomplete key-value: cannot find end of key", ctx, startPtr);
}
function parseInlineTable(ctx) {
  let startPtr = ctx.p++;
  let res = /* @__PURE__ */ Object.create(null);
  let seen = /* @__PURE__ */ new Set();
  let c;
  while (ctx.p < ctx.s.length) {
    skipVoid(ctx);
    if ((c = ctx.s.charCodeAt(ctx.p)) === 125) {
      ctx.p++;
      return res;
    }
    let k;
    let t = res;
    let hasOwn = false;
    let errPtr = ctx.p;
    let key = parseKey(ctx);
    for (let i = 0; i < key.length; i++) {
      if (i)
        t = hasOwn ? t[k] : t[k] = /* @__PURE__ */ Object.create(null);
      k = key[i];
      if ((hasOwn = Object.hasOwn(t, k)) && (typeof t[k] !== "object" || seen.has(t[k]))) {
        TomlError.x("trying to redefine an already defined value", ctx, errPtr);
      }
      let unsafe = k === "__proto__";
      if (ctx.uk && (unsafe || k === "constructor")) {
        t = ctx.uk !== 1 && TomlError.x("document contains an unsafe property", ctx, errPtr);
        break;
      }
      if (!hasOwn && unsafe) {
        Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
      }
    }
    if (hasOwn) {
      TomlError.x("trying to redefine an already defined value", ctx, errPtr);
    }
    skipVoid(ctx, true, true);
    let value = extractValue(
      ctx,
      125
      /* } */
    );
    if (t && typeof (t[k] = value) === "object")
      seen.add(value);
    skipVoid(ctx);
    if ((c = ctx.s.charCodeAt(ctx.p++)) === 125) {
      return res;
    }
    if (c !== 44)
      TomlError.x("expected comma or end of structure", ctx, ctx.p - 1);
  }
  TomlError.x("unfinished table", ctx, startPtr);
}
function parseArray(ctx) {
  let startPtr = ctx.p++;
  let res = [];
  let c;
  while (ctx.p < ctx.s.length) {
    skipVoid(ctx);
    if ((c = ctx.s.charCodeAt(ctx.p)) === 93) {
      ctx.p++;
      return res;
    }
    res.push(extractValue(
      ctx,
      93
      /* ] */
    ));
    skipVoid(ctx);
    if ((c = ctx.s.charCodeAt(ctx.p++)) === 93) {
      return res;
    }
    if (c !== 44)
      TomlError.x("expected comma or end of structure", ctx, ctx.p - 1);
  }
  TomlError.x("unfinished array", ctx, startPtr);
}

// node_modules/smol-toml/dist/parse.js
function peekTable(ctx, key, table, meta, type) {
  let t = table;
  let m = meta;
  let k;
  let hasOwn = false;
  let state;
  for (let i = 0; i < key.length; i++) {
    if (i) {
      t = hasOwn ? t[k] : t[k] = /* @__PURE__ */ Object.create(null);
      m = (state = m[k]).c;
      if (type === 0 && (state.t === 1 || state.t === 2)) {
        return null;
      }
      if (state.t === 2) {
        let l = t.length - 1;
        t = t[l];
        m = m[l].c;
      }
    }
    k = key[i];
    if ((hasOwn = Object.hasOwn(t, k)) && m[k]?.t === 0 && m[k]?.d) {
      return null;
    }
    if (!hasOwn) {
      let unsafe = k === "__proto__";
      if (ctx.uk && (unsafe || k === "constructor"))
        return false;
      if (unsafe) {
        Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
        Object.defineProperty(m, k, { enumerable: true, configurable: true, writable: true });
      }
      m[k] = {
        t: i < key.length - 1 && type === 2 ? 3 : type,
        d: false,
        i: 0,
        c: /* @__PURE__ */ Object.create(null)
      };
    }
  }
  state = m[k];
  if (state.t !== type && !(type === 1 && state.t === 3)) {
    return null;
  }
  if (type === 2) {
    if (!state.d) {
      state.d = true;
      t[k] = [];
    }
    t[k].push(t = /* @__PURE__ */ Object.create(null));
    state.c[state.i++] = state = { t: 1, d: false, i: 0, c: /* @__PURE__ */ Object.create(null) };
  }
  if (state.d) {
    return null;
  }
  state.d = true;
  if (type === 1) {
    t = hasOwn ? t[k] : t[k] = /* @__PURE__ */ Object.create(null);
  } else if (type === 0 && hasOwn) {
    return null;
  }
  return [k, t, state.c];
}
function validateTablePeek(ctx, peek, ptr) {
  if (peek === null || ctx.uk === 2)
    TomlError.x(peek === null ? "trying to redefine an already defined table or value" : "document contains an unsafe property", ctx, ptr);
}
function parse2(toml, options = {}) {
  let ctx = {
    s: toml,
    p: 0,
    d: options.maxDepth ?? 1e3,
    bi: options.integersAsBigInt ?? false,
    ld: options.useLegacyDate ?? true,
    uk: options.unsafeKeyBehaviour === "throw" ? 2 : options.unsafeKeyBehaviour === "drop" ? 1 : 0
  };
  let res = /* @__PURE__ */ Object.create(null);
  let meta = /* @__PURE__ */ Object.create(null);
  let tmp;
  let skipping = false;
  let tbl = res;
  let m = meta;
  if (toml.charCodeAt(0) === 65279)
    ctx.p++;
  skipVoid(ctx);
  while (ctx.p < toml.length) {
    if (toml.charCodeAt(ctx.p) === 91) {
      let isTableArray = toml.charCodeAt(++ctx.p) === 91;
      tmp = ctx.p += +isTableArray;
      skipping = false;
      let k = parseKey(
        ctx,
        93
        /* ] */
      );
      if (isTableArray) {
        if (toml.charCodeAt(ctx.p) !== 93) {
          TomlError.x("expected end of table array declaration", ctx);
        }
        ctx.p++;
      }
      let p = peekTable(
        ctx,
        k,
        res,
        meta,
        isTableArray ? 2 : 1
        /* Type.EXPLICIT */
      );
      if (!p) {
        validateTablePeek(ctx, p, tmp);
        skipping = true;
      } else {
        m = p[2];
        tbl = p[1];
      }
    } else {
      tmp = ctx.p;
      let k = parseKey(ctx);
      let p = peekTable(
        ctx,
        k,
        tbl,
        m,
        0
        /* Type.DOTTED */
      );
      if (!p && !skipping)
        validateTablePeek(ctx, p, tmp);
      skipVoid(ctx, true, true);
      let v = extractValue(ctx, void 0);
      if (p && !skipping)
        p[1][p[0]] = v;
    }
    skipVoid(ctx, true);
    if (ctx.p < toml.length && (tmp = toml.charCodeAt(ctx.p)) !== 10 && (tmp !== 13 || toml.charCodeAt(ctx.p + 1) !== 10)) {
      TomlError.x("each key-value declaration must be followed by an end-of-line", ctx);
    }
    skipVoid(ctx);
  }
  return res;
}

// node_modules/smol-toml/dist/stringify.js
var HAS_WELLFORMED = !!"".isWellFormed;

// src/core/hook.ts
import { existsSync as existsSync2 } from "fs";

// src/core/bank.ts
import { existsSync } from "fs";
import { homedir as homedir2 } from "os";
import { basename, dirname as dirname3, join as join4, normalize, sep } from "path";

// src/core/diag.ts
import { readFileSync } from "fs";
import { join as join2 } from "path";

// src/core/log.ts
import { appendFileSync, mkdirSync, renameSync, statSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
function logsDir() {
  return join(homedir(), ".hindsight", "coding-agents-logs");
}
var LOG_MAX_BYTES = 10 * 1024 * 1024;
function appendLogLine(file, text) {
  mkdirSync(dirname(file), { recursive: true, mode: 448 });
  try {
    if (statSync(file).size >= LOG_MAX_BYTES) renameSync(file, `${file}.1`);
  } catch {
  }
  appendFileSync(file, text, { mode: 384 });
}
var WEIGHT = { debug: 10, info: 20, warn: 30, error: 40 };
var current = ["debug", "info", "warn", "error"].find(
  (l) => l === process.env.HINDSIGHT_LOG_LEVEL
) ?? "info";
function logFilePath() {
  return process.env.HINDSIGHT_LOG_FILE || join(logsDir(), "plugin.log");
}
function write(level, scope, msg, extra) {
  if (WEIGHT[level] < WEIGHT[current]) return;
  try {
    appendLogLine(
      logFilePath(),
      `${(/* @__PURE__ */ new Date()).toISOString()} ${level.toUpperCase().padEnd(5)} [${scope}] ${msg}` + (extra && Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : "") + "\n"
    );
  } catch {
  }
}
var log = {
  debug: (scope, msg, extra) => write("debug", scope, msg, extra),
  info: (scope, msg, extra) => write("info", scope, msg, extra),
  warn: (scope, msg, extra) => write("warn", scope, msg, extra),
  error: (scope, msg, extra) => write("error", scope, msg, extra)
};

// src/core/diag.ts
function diagFilePath() {
  return process.env.HINDSIGHT_DIAG_FILE || join2(logsDir(), "diag.jsonl");
}
function diag(harness, event, extra = {}) {
  log.debug(harness, `diag:${event}`, extra);
  try {
    appendLogLine(
      diagFilePath(),
      JSON.stringify({ ts: (/* @__PURE__ */ new Date()).toISOString(), harness, event, ...extra }) + "\n"
    );
  } catch {
  }
}

// src/core/git-layout.ts
import { lstatSync, readFileSync as readFileSync2, realpathSync } from "fs";
import { dirname as dirname2, isAbsolute, join as join3, resolve } from "path";

// src/core/config.ts
import { readFileSync as readFileSync3 } from "fs";
import { homedir as homedir3 } from "os";
import { join as join7 } from "path";

// src/core/seed.ts
import { spawn as realSpawn } from "child_process";
import { dirname as dirname4, join as join5 } from "path";
import { fileURLToPath } from "url";

// src/core/missions.ts
import { createHash } from "crypto";
var PAGE_TAXONOMY = [
  {
    name: "Component map",
    source_query: "From this project's commit history and past discussions, what are the main components/modules/subsystems, what is each responsible for, and how do they relate to or depend on one another? Describe the structure and responsibilities.",
    tags: ["knowledge:component"]
  },
  {
    name: "Core concepts",
    source_query: "What are the core concepts, domain abstractions, and key entities in this project \u2014 the vocabulary a developer must understand? For each, explain what it represents and its role, drawn from how they are introduced and discussed across the history and conversations.",
    tags: ["knowledge:concept"]
  },
  {
    name: "Conventions and patterns",
    source_query: "What conventions, idioms, and recurring patterns does this project follow \u2014 its approach to testing, error handling, naming, structure, and how changes are typically made? Describe how THIS project does things, as evidenced across its history and discussions.",
    tags: ["knowledge:convention"]
  },
  {
    name: "Key decisions and rationale",
    source_query: "What are the significant technical decisions made in this project and the rationale behind them \u2014 the durable 'why we do it this way' a developer should know? Summarize the decisions and their reasoning from the commit rationales and past conversations.",
    tags: ["knowledge:decision"]
  },
  {
    name: "Initiatives and enhancements",
    source_query: "Based on this repository's commit history, what are the major initiatives, features, and enhancements the project has worked on? Summarize the themes and notable changes over time. When a source memory's context carries a `[[page:<id>]]` link, repeat that link in the summary of what it describes, so each initiative links to its detailed page.",
    tags: ["knowledge:feature-work"]
  }
];
var PAGE_NAMES = PAGE_TAXONOMY.map((page) => page.name);

// package.json
var version = "0.8.2";

// src/core/util.ts
import { accessSync, constants } from "fs";
import { delimiter, join as join6 } from "path";
function isOurMcpEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry;
  if (candidate.command !== "node" || !Array.isArray(candidate.args)) return false;
  const script = candidate.args[0];
  if (typeof script !== "string") return false;
  const parts = script.replaceAll("\\", "/").split("/").filter(Boolean);
  return parts.at(-1) === "mcp-server.js" && parts.at(-2) === "dist" && (parts.at(-3) === "coding-agents" || parts.at(-3) === "hindsight-coding-agents");
}

// src/core/hindsight.ts
var USER_AGENT = `hindsight-coding-agents/${version}`;
var RETRY_AFTER_FLOOR_MS = 10 * 1e3;
var RETRY_AFTER_CEILING_MS = 60 * 1e3;

// src/core/config.ts
var CONFIG_PATH = process.env.HINDSIGHT_CONFIG || join7(homedir3(), ".hindsight", "coding-agent.json");
var DEFAULT_DAEMON_PORT = 9077;

// src/core/brand.ts
function brandWord() {
  const start = [0, 116, 217];
  const end = [0, 146, 150];
  const word = "Hindsight";
  let out = "";
  for (let i = 0; i < word.length; i++) {
    const t = i / (word.length - 1);
    const [r, g, b] = start.map((s, k) => Math.round(s + (end[k] - s) * t));
    out += `\x1B[38;2;${r};${g};${b}m${word[i]}`;
  }
  return `${out}\x1B[0m`;
}

// src/core/session-cache.ts
import { mkdirSync as mkdirSync2, readFileSync as readFileSync4, renameSync as renameSync2, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname as dirname5, join as join8 } from "path";

// src/core/turn-journal.ts
import { appendFileSync as appendFileSync2, mkdirSync as mkdirSync3, readFileSync as readFileSync5, statSync as statSync2 } from "fs";
import { tmpdir as tmpdir2 } from "os";
import { dirname as dirname6, join as join9 } from "path";

// src/core/transcript-util.ts
var MEMORY_TAG_RE = /<(hook_prompt|task-notification|system-reminder|hindsight_memory|hindsight_memories|hindsight_bank|relevant_memories|user_feedback|hindsight_knowledge|hindsight_knowledge_refresh)\b[\s\S]*?<\/\1>/g;
function stripInjectedMemory(s) {
  return s.replace(MEMORY_TAG_RE, "");
}
var TARGET_KEYS = [
  "file_path",
  "path",
  "notebook_path",
  "command",
  "pattern",
  "query",
  "url",
  "name",
  "id"
];
var ACTION_TARGET_CAP = 100;
function actionLine(tool, input) {
  let target = "";
  if (input && typeof input === "object") {
    const rec = input;
    for (const k of TARGET_KEYS) {
      const v = rec[k];
      if (typeof v === "string" && v.trim()) {
        target = v.trim().split("\n")[0];
        break;
      }
    }
  } else if (typeof input === "string") {
    target = input.trim().split("\n")[0];
  }
  if (target.length > ACTION_TARGET_CAP) target = `${target.slice(0, ACTION_TARGET_CAP)}\u2026`;
  return target ? `${tool} ${target}` : tool;
}

// src/core/turn-journal.ts
var JOURNAL_MAX_BYTES = 8 * 1024 * 1024;

// src/core/retain-cursor.ts
import { createHash as createHash2 } from "crypto";
var PENDING_MAX_AGE_MS = 12 * 60 * 60 * 1e3;
var PENDING_MAX_BYTES = 256 * 1024;

// src/core/uuid.ts
import { createHash as createHash3 } from "crypto";

// src/core/daemon.ts
import { execFileSync, spawn as realSpawn2 } from "child_process";
import { dirname as dirname7, join as join10 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
function hasRustToolchain() {
  if (process.platform !== "darwin") return true;
  try {
    execFileSync("cargo", ["--version"], {
      stdio: "pipe",
      timeout: 1e4,
      windowsHide: true
    });
    return true;
  } catch {
    return false;
  }
}
function hasUvx() {
  try {
    execFileSync("uvx", ["--version"], {
      stdio: "pipe",
      timeout: 1e4,
      windowsHide: true
    });
    return true;
  } catch {
    return false;
  }
}
var PROVIDER_PROBES = [
  { provider: "openai", keyEnv: "OPENAI_API_KEY" },
  { provider: "anthropic", keyEnv: "ANTHROPIC_API_KEY" },
  { provider: "gemini", keyEnv: "GEMINI_API_KEY" },
  { provider: "groq", keyEnv: "GROQ_API_KEY" }
];
function detectLlm(env = process.env) {
  const explicit = env.HINDSIGHT_API_LLM_PROVIDER?.trim();
  if (explicit) {
    return {
      provider: explicit,
      apiKey: env.HINDSIGHT_API_LLM_API_KEY?.trim() || void 0,
      source: "HINDSIGHT_API_LLM_PROVIDER"
    };
  }
  for (const probe of PROVIDER_PROBES) {
    const key = env[probe.keyEnv]?.trim();
    if (key) return { provider: probe.provider, apiKey: key, source: probe.keyEnv };
  }
  if (onPath("claude")) {
    return { provider: "claude-code", source: "the Claude Code CLI on PATH (no API key needed)" };
  }
  return void 0;
}
function onPath(bin) {
  try {
    execFileSync("which", [bin], {
      stdio: "pipe",
      timeout: 5e3,
      windowsHide: true
    });
    return true;
  } catch {
    return false;
  }
}

// src/core/retain-stamp.ts
import { basename as basename2 } from "path";

// src/core/jsonl.ts
import { closeSync, openSync, readSync } from "fs";
import { StringDecoder } from "string_decoder";
var CHUNK_BYTES = 64 * 1024;
function* readJsonl(path) {
  let fd;
  try {
    fd = openSync(path, "r");
  } catch {
    return;
  }
  try {
    const buffer = Buffer.allocUnsafe(CHUNK_BYTES);
    const decoder = new StringDecoder("utf8");
    let pending = "";
    let position = 0;
    for (; ; ) {
      const bytesRead = readSync(fd, buffer, 0, buffer.length, position);
      if (bytesRead <= 0) break;
      position += bytesRead;
      pending += decoder.write(buffer.subarray(0, bytesRead));
      let newline;
      while ((newline = pending.indexOf("\n")) !== -1) {
        yield pending.slice(0, newline);
        pending = pending.slice(newline + 1);
      }
    }
    pending += decoder.end();
    if (pending) yield pending;
  } finally {
    closeSync(fd);
  }
}

// src/core/transcript.ts
function renderLine(content, type) {
  if (typeof content === "string") {
    const text = stripInjectedMemory(content).trim();
    return text ? [{ role: type, content: text }] : [];
  }
  if (!Array.isArray(content)) return [];
  const texts = [];
  const actions = [];
  for (const b of content) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "text" && typeof b.text === "string") {
      const t = stripInjectedMemory(b.text).trim();
      if (t) texts.push(t);
    } else if (b.type === "tool_use" && typeof b.name === "string") {
      actions.push({ role: "action", content: actionLine(b.name, b.input) });
    }
  }
  const out = [];
  const joined = texts.join("\n").trim();
  if (joined) out.push({ role: type, content: joined });
  out.push(...actions);
  return out;
}
function readClaudeTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const line = parsed;
    if (line.type !== "user" && line.type !== "assistant") continue;
    if (line.isMeta === true) continue;
    if (line.isSidechain === true) continue;
    if (line.isCompactSummary === true) continue;
    if (typeof line.message !== "object" || line.message === null) continue;
    for (const rendered of renderLine(line.message.content, line.type)) {
      const turn = { role: rendered.role, content: rendered.content };
      if (typeof line.timestamp === "string") turn.timestamp = line.timestamp;
      turns.push(turn);
    }
  }
  return turns;
}

// src/core/usage.ts
import { readFileSync as readFileSync6 } from "fs";
import { join as join11 } from "path";
function usageFilePath() {
  return process.env.HINDSIGHT_USAGE_FILE || join11(logsDir(), "usage.jsonl");
}
var RETRIEVAL_TOOLS = /* @__PURE__ */ new Set([
  "hindsight_search_knowledge_pages",
  "hindsight_list_knowledge_pages",
  "hindsight_read_knowledge_page",
  "hindsight_reflect"
]);
function isUsageLine(v) {
  const r = v;
  return typeof r === "object" && r !== null && typeof r.harness === "string" && typeof r.session === "string" && typeof r.turn === "number" && Array.isArray(r.calls) && typeof r.credited === "boolean";
}
function readUsage(path = usageFilePath()) {
  const latest = /* @__PURE__ */ new Map();
  for (const file of [`${path}.1`, path]) {
    let text = "";
    try {
      text = readFileSync6(file, "utf8");
    } catch {
      continue;
    }
    for (const raw of text.split("\n")) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      if (!isUsageLine(parsed)) continue;
      latest.set(`${parsed.harness}
${parsed.session}
${parsed.turn}`, parsed);
    }
  }
  const byHarness = /* @__PURE__ */ new Map();
  for (const line of latest.values()) {
    let h = byHarness.get(line.harness);
    if (!h) {
      h = {
        harness: line.harness,
        turns: 0,
        turnsWithCalls: 0,
        calls: 0,
        turnsWithRetrieval: 0,
        creditedTurnsWithRetrieval: 0,
        byTool: {}
      };
      byHarness.set(line.harness, h);
    }
    h.turns++;
    h.calls += line.calls.length;
    for (const tool of line.calls) h.byTool[tool] = (h.byTool[tool] ?? 0) + 1;
    if (line.calls.length) h.turnsWithCalls++;
    if (line.calls.some((tool) => RETRIEVAL_TOOLS.has(tool))) {
      h.turnsWithRetrieval++;
      if (line.credited) h.creditedTurnsWithRetrieval++;
    }
  }
  return [...byHarness.values()].sort((a, b) => b.turns - a.turns);
}
var pct = (n, d) => d ? `${Math.round(100 * n / d)}%` : "-";
function formatUsageReport(usage, path = usageFilePath()) {
  if (!usage.length) return `no Hindsight usage recorded yet (${path})`;
  const out = [`Hindsight tool usage (${path})`, ""];
  for (const h of usage) {
    out.push(
      `${h.harness}: ${h.turns} turns \xB7 ${h.turnsWithCalls} with a Hindsight call (${pct(h.turnsWithCalls, h.turns)}) \xB7 ${(h.calls / h.turns).toFixed(2)} calls/turn \xB7 credited after retrieval ${h.creditedTurnsWithRetrieval}/${h.turnsWithRetrieval} (${pct(h.creditedTurnsWithRetrieval, h.turnsWithRetrieval)})`
    );
    for (const [tool, n] of Object.entries(h.byTool).sort((a, b) => b[1] - a[1])) {
      out.push(`    ${tool}: ${n}`);
    }
  }
  return out.join("\n");
}

// src/core/git.ts
import { execFileSync as execFileSync2 } from "child_process";
import { resolve as resolve2 } from "path";
var US = "";
var RS = "";
var GITLOG_FORMAT = `--format=%h${US}%ad${US}%an${US}%s${US}%b${RS}`;

// src/core/status.ts
import { execFileSync as execFileSync4 } from "child_process";

// src/core/survey.ts
import { execFileSync as execFileSync3, spawn as realSpawn4 } from "child_process";
import { createHash as createHash4 } from "crypto";
import { existsSync as existsSync3 } from "fs";
import { homedir as homedir4, tmpdir as tmpdir3 } from "os";
import { dirname as dirname8, join as join13 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";

// src/core/survey-lease.ts
import { spawn as realSpawn3 } from "child_process";
import { randomUUID } from "crypto";
import {
  mkdirSync as mkdirSync4,
  mkdtempSync,
  readdirSync,
  renameSync as renameSync3,
  rmdirSync,
  rmSync as rmSync2,
  statSync as statSync3,
  unlinkSync,
  utimesSync,
  writeFileSync as writeFileSync2
} from "fs";
import { join as join12 } from "path";

// src/core/auto-update.ts
import { spawn as realSpawn5 } from "child_process";
import {
  existsSync as existsSync4,
  mkdirSync as mkdirSync5,
  readFileSync as readFileSync7,
  realpathSync as realpathSync2,
  unlinkSync as unlinkSync2,
  writeFileSync as writeFileSync3
} from "fs";
import { homedir as homedir5, tmpdir as tmpdir4 } from "os";
import { dirname as dirname9, join as join14 } from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
var CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;
var NPM_VIEW_TIMEOUT_MS = 5e3;
var NPM_VIEW_HARD_DEADLINE_MS = NPM_VIEW_TIMEOUT_MS + 1e3;
var LOCK_STALE_MS = 10 * 60 * 1e3;

// src/core/skill-sync.ts
import { cpSync, existsSync as existsSync6, readFileSync as readFileSync8 } from "fs";
import { homedir as homedir6 } from "os";
import { dirname as dirname10, join as join16 } from "path";
import { fileURLToPath as fileURLToPath5 } from "url";

// src/core/skill-dirs.ts
import { existsSync as existsSync5 } from "fs";
import { join as join15 } from "path";
var SKILL_DIRS = {
  "claude-code": [".claude", "skills"],
  // Codex and dsh share the agentskills-standard root; uninstalling either removes the one copy.
  codex: [".agents", "skills"],
  dsh: [".agents", "skills"],
  "antigravity-cli": [".gemini", "config", "skills"],
  "cursor-cli": [".cursor", "skills"],
  "copilot-cli": [".copilot", "skills"],
  "grok-build": [".grok", "skills"],
  "cline-cli": [".cline", "data", "settings", "skills"],
  "qwen-code": [".qwen", "skills"],
  // Qwen's user-level skills root (Storage.getUserSkillsDirs)
  // Kimi Code's user-level skills root, alongside its config.toml and mcp.json.
  "kimi-code": [".kimi-code", "skills"],
  "factory-droid": [".factory", "skills"],
  // Droid's user-level skills root
  // ZCode scans TWO user roots by default (its resolveDefaultSkillRoots): `~/.zcode/skills` and the
  // shared agentskills `~/.agents/skills`. Write its OWN, for the same reason the pi family does —
  // skill removal is by fixed directory name, so installing into the shared root would make
  // `uninstall zcode` take Codex's and dsh's copy with it.
  zcode: [".zcode", "skills"],
  // TraeCode's user-level skills root, resolved per edition by traecodeDotDir below — like ZCode's
  // its own, never the shared agentskills root other hosts install into.
  traecode: [".trae-cn", "skills"],
  // The pi family reads the shared ~/.agents/skills too, but writes its OWN root: skill removal is
  // by fixed directory name, so installing to the shared one would make `uninstall pi` take Codex's
  // and dsh's copy with it.
  pi: [".pi", "agent", "skills"],
  "prime-agent": [".prime", "agent", "skills"],
  // WorkBuddy's own user-level skills root (the @genie/agent-cli engine reads ~/.workbuddy).
  workbuddy: [".workbuddy", "skills"],
  // CodeBuddy Code reads that SAME engine's default root, ~/.codebuddy — WorkBuddy only overrides
  // its home folder (product config `dataLayout.configDir.userDirName`), so the two differ by config.
  codebuddy: [".codebuddy", "skills"]
};
var TRAE_DOT_DIRS = [".trae-cn", ".trae"];
var traecodeDotDirName = (home, exists = existsSync5) => {
  for (const dir of TRAE_DOT_DIRS) {
    if (exists(join15(home, dir))) return dir;
  }
  return ".trae-cn";
};
var resolveSkillDirs = (harness, home) => {
  const parts = SKILL_DIRS[harness];
  if (harness === "traecode" && parts) {
    return [traecodeDotDirName(home), ...parts.slice(1)];
  }
  return parts;
};

// src/core/legacy.ts
import { existsSync as existsSync7, readFileSync as readFileSync9 } from "fs";
import { homedir as homedir7 } from "os";
import { join as join17, relative, isAbsolute as isAbsolute2 } from "path";
var LEGACY_CONFIG_FILES = {
  "claude-code": "claude-code.json",
  codex: "codex.json"
};
function legacyConfigPath(harness, home = homedir7()) {
  return join17(home, ".hindsight", LEGACY_CONFIG_FILES[harness] ?? `${harness}.json`);
}
var CLOUD_URL = "https://api.hindsight.vectorize.io";
function readLegacyEndpoint(home = homedir7(), prefer = []) {
  const order = [...prefer, ...Object.keys(LEGACY_CONFIG_FILES)].filter(
    (h, i, all) => h in LEGACY_CONFIG_FILES && all.indexOf(h) === i
  );
  for (const harness of order) {
    const found = readOne(harness, home);
    if (found) return found;
  }
  return void 0;
}
function readOne(harness, home) {
  const source = legacyConfigPath(harness, home);
  if (!existsSync7(source)) return void 0;
  let raw;
  try {
    raw = JSON.parse(readFileSync9(source, "utf8"));
  } catch {
    return void 0;
  }
  if (!raw || typeof raw !== "object") return void 0;
  const apiToken = typeof raw.hindsightApiToken === "string" ? raw.hindsightApiToken : void 0;
  const url = typeof raw.hindsightApiUrl === "string" ? raw.hindsightApiUrl.trim() : "";
  if (url) {
    return {
      harness,
      serverMode: url.replace(/\/+$/, "") === CLOUD_URL ? "cloud" : "self-hosted",
      apiUrl: url,
      ...apiToken ? { apiToken } : {},
      source
    };
  }
  const port = typeof raw.apiPort === "number" ? raw.apiPort : void 0;
  return {
    harness,
    serverMode: "daemon",
    ...apiToken ? { apiToken } : {},
    ...port && port !== DEFAULT_DAEMON_PORT ? { apiPort: port } : {},
    source
  };
}

// src/core/traecode-mcp.ts
import { execFileSync as execFileSync5 } from "child_process";
import { existsSync as existsSync8, mkdirSync as mkdirSync6, readFileSync as readFileSync10, readdirSync as readdirSync2, rmSync as rmSync3, writeFileSync as writeFileSync4 } from "fs";
import { homedir as homedir8 } from "os";
import { dirname as dirname11, isAbsolute as isAbsolute3, join as join18 } from "path";
import { fileURLToPath as fileURLToPath6 } from "url";
var MCP_SERVER_NAME = "hindsight";
var MCP_FILE_REL = join18(".trae", "mcp.json");
function bundledDistDir() {
  const here = dirname11(fileURLToPath6(import.meta.url));
  return existsSync8(join18(here, "mcp-server.js")) ? here : join18(here, "..", "..", "dist");
}
function canon(value) {
  if (Array.isArray(value)) return `[${value.map(canon).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(
      ([a], [b]) => a < b ? -1 : a > b ? 1 : 0
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canon(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
var WORKSPACE_MCP_KEY = "trae.mcp.enableWorkspaceMcp";
var HINT_MIN_INTERVAL_MS = 24 * 60 * 60 * 1e3;
function traecodeUserDataDir(home) {
  const root = process.platform === "darwin" ? join18(home, "Library", "Application Support") : process.platform === "win32" ? process.env.APPDATA ?? join18(home, "AppData", "Roaming") : process.env.XDG_CONFIG_HOME ?? join18(home, ".config");
  for (const brand of ["Trae CN", "Trae"]) {
    const dir = join18(root, brand);
    if (existsSync8(dir)) return dir;
  }
  return join18(root, "Trae CN");
}
var traecodeUserSettingsPath = (home) => join18(traecodeUserDataDir(home), "User", "settings.json");
var gateStateFileFor = (dist) => join18(dirname11(dist), ".workspace-mcp.json");
function gateStateFile() {
  return gateStateFileFor(bundledDistDir());
}
function readGateState(opts = {}) {
  try {
    return JSON.parse(readFileSync10(opts.stateFile ?? gateStateFile(), "utf8"));
  } catch {
    return {};
  }
}
function workspaceMcpGateState(settingsPath) {
  let raw;
  try {
    raw = readFileSync10(settingsPath, "utf8");
  } catch {
    return "unknown";
  }
  try {
    const doc = JSON.parse(raw);
    return doc[WORKSPACE_MCP_KEY] === true ? "on" : "off";
  } catch {
    const hit = raw.match(new RegExp(`"${WORKSPACE_MCP_KEY}"\\s*:\\s*(true|false)`));
    return hit ? hit[1] === "true" ? "on" : "off" : "unknown";
  }
}
function enableWorkspaceMcpSetting(settingsPath) {
  try {
    let doc = {};
    try {
      doc = JSON.parse(readFileSync10(settingsPath, "utf8"));
    } catch {
      if (existsSync8(settingsPath)) return false;
    }
    doc[WORKSPACE_MCP_KEY] = true;
    mkdirSync6(dirname11(settingsPath), { recursive: true });
    writeFileSync4(settingsPath, JSON.stringify(doc, null, 2) + "\n");
    return true;
  } catch {
    return false;
  }
}
function markWorkspaceMcpEnabled(opts = {}) {
  try {
    writeFileSync4(
      opts.stateFile ?? gateStateFile(),
      JSON.stringify({ ...readGateState(opts), workspaceMcpEnabled: true }, null, 2) + "\n"
    );
  } catch {
  }
}
function workspaceMcpHint(opts = {}) {
  try {
    const settingsPath = traecodeUserSettingsPath(opts.home ?? homedir8());
    if (workspaceMcpGateState(settingsPath) === "on") return void 0;
    const now = opts.now ?? Date.now();
    const state = readGateState(opts);
    if (state.workspaceMcpEnabled) return void 0;
    if (typeof state.lastHint === "number" && now - state.lastHint < HINT_MIN_INTERVAL_MS) {
      return void 0;
    }
    writeFileSync4(
      opts.stateFile ?? gateStateFile(),
      JSON.stringify({ ...state, lastHint: now }, null, 2) + "\n"
    );
    return 'Hindsight MCP tools are hidden: TraeCode does not read per-repo MCP configs until workspace MCP is enabled. Turn it on once in Trae settings (search "enableWorkspaceMcp") or re-run `hindsight-coding-agents install traecode` \u2014 then reload this window.';
  } catch {
    return void 0;
  }
}
function gitignoreCovers(lines) {
  return lines.some((l) => {
    const t = l.trim();
    return t.includes(".trae");
  });
}
function ensureGitignored(repo) {
  const gitignore = join18(repo, ".gitignore");
  if (!existsSync8(gitignore)) return;
  const current2 = readFileSync10(gitignore, "utf8");
  if (gitignoreCovers(current2.split("\n"))) return;
  const addition = (current2.endsWith("\n") || current2 === "" ? "" : "\n") + "# hindsight MCP registration (machine-specific)\n.trae/mcp.json\n";
  writeFileSync4(gitignore, current2 + addition);
}
function ensureTraecodeWorkspaceMcp(cwd, opts = {}) {
  registerTraecodeWorkspaceMcp(cwd, opts);
  const seeded = ensureWorkspaceMcpEnabled(cwd, opts);
  return workspaceMcpHint(opts) ?? (seeded === "failed" ? workspaceEnableHint(opts) : void 0);
}
function registerTraecodeWorkspaceMcp(cwd, opts = {}) {
  try {
    const home = opts.home ?? homedir8();
    if (!cwd || !isAbsolute3(cwd) || dirname11(cwd) === cwd || cwd === home) return "skipped";
    const dist = opts.dist ?? bundledDistDir();
    const script = join18(dist, "mcp-server.js");
    if (!existsSync8(script)) return "skipped";
    const file = join18(cwd, MCP_FILE_REL);
    let doc = {};
    let exists = false;
    try {
      doc = JSON.parse(readFileSync10(file, "utf8"));
      exists = true;
    } catch {
      if (existsSync8(file)) return "skipped";
    }
    const servers = doc.mcpServers && typeof doc.mcpServers === "object" && !Array.isArray(doc.mcpServers) ? doc.mcpServers : doc.mcpServers = {};
    const entry = {
      command: "node",
      args: [script],
      env: { HINDSIGHT_MCP_HARNESS: "traecode", HINDSIGHT_MCP_PROJECT_CWD: cwd }
    };
    const existing = servers[MCP_SERVER_NAME];
    let merged;
    if (existing === void 0) {
      merged = entry;
    } else if (isOurMcpEntry(existing)) {
      const env = existing.env;
      merged = {
        ...existing,
        command: entry.command,
        args: entry.args,
        env: { ...env ?? {}, ...entry.env }
      };
    } else {
      diag("traecode", "workspace_mcp_foreign_entry", { cwd, file });
      return "skipped";
    }
    if (existing !== void 0 && canon(merged) === canon(existing)) return "current";
    servers[MCP_SERVER_NAME] = merged;
    mkdirSync6(dirname11(file), { recursive: true });
    writeFileSync4(file, JSON.stringify(doc, null, 2) + "\n");
    if (!exists) ensureGitignored(cwd);
    diag("traecode", "workspace_mcp_registered", { cwd, file });
    return "registered";
  } catch (e) {
    diag("traecode", "workspace_mcp_register_failed", {
      cwd,
      error: e instanceof Error ? e.message : String(e)
    });
    return "failed";
  }
}
function removeTraecodeWorkspaceMcpEntry(cwd, opts = {}) {
  try {
    const home = opts.home ?? homedir8();
    if (!cwd || !isAbsolute3(cwd) || dirname11(cwd) === cwd || cwd === home) return false;
    const file = join18(cwd, MCP_FILE_REL);
    let doc;
    try {
      doc = JSON.parse(readFileSync10(file, "utf8"));
    } catch {
      return false;
    }
    const servers = doc.mcpServers;
    if (!servers || typeof servers !== "object" || Array.isArray(servers)) return false;
    const record = servers;
    if (!isOurMcpEntry(record[MCP_SERVER_NAME])) return false;
    delete record[MCP_SERVER_NAME];
    if (Object.keys(record).length === 0) delete doc.mcpServers;
    if (Object.keys(doc).length === 0) rmSync3(file);
    else writeFileSync4(file, JSON.stringify(doc, null, 2) + "\n");
    return true;
  } catch {
    return false;
  }
}
var WORKSPACE_STORAGE_REL = join18("User", "workspaceStorage");
var ENABLED_KEY_PREFIX = "icubeAgentExtension.enabled.mcp.config.ws0.";
var SQLITE_TIMEOUT_MS = 5e3;
var TRAECODE_WORKSPACE_ENABLED_KEY = ENABLED_KEY_PREFIX + MCP_SERVER_NAME;
var traecodeWorkspaceStorageDir = (home) => join18(traecodeUserDataDir(home), WORKSPACE_STORAGE_REL);
function removeWorkspaceMcpEnabledKeys(home) {
  const storage = traecodeWorkspaceStorageDir(home);
  let entries;
  try {
    entries = readdirSync2(storage);
  } catch {
    return;
  }
  for (const name of entries) {
    const db = join18(storage, name, "state.vscdb");
    if (!existsSync8(db)) continue;
    try {
      execFileSync5(
        "sqlite3",
        [
          db,
          ".timeout 3000",
          `DELETE FROM ItemTable WHERE key='${TRAECODE_WORKSPACE_ENABLED_KEY}';`
        ],
        {
          timeout: SQLITE_TIMEOUT_MS,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"]
        }
      );
    } catch {
    }
  }
}
function findWorkspaceStorageDir(storage, repo) {
  let entries;
  try {
    entries = readdirSync2(storage);
  } catch {
    return void 0;
  }
  for (const name of entries) {
    try {
      const doc = JSON.parse(readFileSync10(join18(storage, name, "workspace.json"), "utf8"));
      if (typeof doc.folder !== "string") continue;
      let folder;
      try {
        folder = fileURLToPath6(doc.folder);
      } catch {
        folder = doc.folder;
      }
      if (folder === repo) return join18(storage, name);
    } catch {
      continue;
    }
  }
  return void 0;
}
function ensureWorkspaceMcpEnabled(cwd, opts = {}) {
  try {
    const home = opts.home ?? homedir8();
    if (!cwd || !isAbsolute3(cwd) || dirname11(cwd) === cwd || cwd === home) return "failed";
    const dir = findWorkspaceStorageDir(traecodeWorkspaceStorageDir(home), cwd);
    if (!dir) return "failed";
    const db = join18(dir, "state.vscdb");
    if (!existsSync8(db)) return "failed";
    const sqlite = opts.sqlite ?? execFileSync5;
    const run2 = (sql) => sqlite("sqlite3", [db, ".timeout 3000", sql], {
      encoding: "utf8",
      timeout: SQLITE_TIMEOUT_MS,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
    if (run2(`SELECT value FROM ItemTable WHERE key='${TRAECODE_WORKSPACE_ENABLED_KEY}';`) === "true") {
      return "on";
    }
    run2(
      `INSERT OR REPLACE INTO ItemTable (key, value) VALUES ('${TRAECODE_WORKSPACE_ENABLED_KEY}', 'true');`
    );
    diag("traecode", "workspace_mcp_enabled_seeded", { cwd, db });
    return "seeded";
  } catch (e) {
    diag("traecode", "workspace_mcp_enabled_seed_failed", {
      cwd,
      error: e instanceof Error ? e.message : String(e)
    });
    return "failed";
  }
}
function workspaceEnableHint(opts = {}) {
  try {
    const now = opts.now ?? Date.now();
    const state = readGateState(opts);
    if (typeof state.lastEnableHint === "number" && now - state.lastEnableHint < HINT_MIN_INTERVAL_MS) {
      return void 0;
    }
    writeFileSync4(
      opts.stateFile ?? gateStateFile(),
      JSON.stringify({ ...state, lastEnableHint: now }, null, 2) + "\n"
    );
    return "Hindsight's MCP server stays disabled in this window: auto-enabling it failed here. Switch hindsight on for this workspace in Trae's MCP panel, then reload the window.";
  } catch {
    return void 0;
  }
}

// src/core/transcript-codex.ts
function stampOf(line) {
  return typeof line.timestamp === "string" && line.timestamp ? { timestamp: line.timestamp } : {};
}
function isSyntheticUserText(text) {
  const s = text.trimStart();
  return s.startsWith("# AGENTS.md instructions for ") || s.startsWith("<environment_context>");
}
var AGENTS_BLOCK_HEADER = /^# AGENTS\.md instructions(?: for [^\n]*)?\n/;
var STARTUP_TAG_BLOCK = /^<(recommended_plugins|environment_context)>(?:(?!<\1>)[\s\S])*<\/\1>$/;
function isStartupItem(text) {
  const s = text.trim();
  if (AGENTS_BLOCK_HEADER.test(s))
    return s.includes("<INSTRUCTIONS>") && s.includes("</INSTRUCTIONS>");
  return STARTUP_TAG_BLOCK.test(s);
}
function contentText(content) {
  return (Array.isArray(content) ? content : []).filter((c) => c && typeof c.text === "string").map((c) => c.text).join("\n");
}
var startupKinds = /* @__PURE__ */ new Set([
  "agents_md.instructions",
  "environments.instructions",
  "environments.environment_context",
  "plugins.recommendations",
  "plugins.usage_instructions"
]);
function fallbackUserText(payload) {
  const content = payload.content;
  const kinds = payload.internal_chat_message_metadata_passthrough?.content_item_kinds;
  if (Array.isArray(content) && Array.isArray(kinds) && kinds.length === content.length && kinds.every((kind) => typeof kind === "string" && kind.length > 0)) {
    return contentText(content.filter((_, index) => !startupKinds.has(kinds[index])));
  }
  const items = (Array.isArray(content) ? content : []).filter(
    (c) => !(c && typeof c.text === "string" && isStartupItem(stripInjectedMemory(c.text)))
  );
  const text = contentText(items);
  return isSyntheticUserText(stripInjectedMemory(text)) ? "" : text;
}
function isUserMessageEvent(line) {
  return line.type === "event_msg" && line.payload?.type === "item_completed" && line.payload.item?.type === "UserMessage";
}
var TOOL_ITEM_TYPES = /* @__PURE__ */ new Set(["McpToolCall", "CommandExecution"]);
function isToolItemEvent(line) {
  return line.type === "event_msg" && line.payload?.type === "item_completed" && TOOL_ITEM_TYPES.has(line.payload.item?.type ?? "");
}
function parseArgs(raw) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
var SHELL_RE = /(?:^|\/)(?:sh|bash|zsh|dash|ksh|fish)$/;
function commandText(command) {
  if (typeof command === "string") return command;
  if (!Array.isArray(command) || !command.every((c) => typeof c === "string")) return "";
  const argv = command;
  if (argv.length === 3 && SHELL_RE.test(argv[0]) && /^-[a-z]*c$/.test(argv[1])) return argv[2];
  return argv.join(" ");
}
function toolItemAction(item) {
  if (item.type === "McpToolCall") {
    if (typeof item.tool !== "string" || !item.tool) return void 0;
    const name = typeof item.server === "string" && item.server ? `mcp__${item.server}__${item.tool}` : item.tool;
    return actionLine(name, parseArgs(item.arguments));
  }
  const command = commandText(item.command).trim();
  return command ? actionLine("exec_command", { command }) : void 0;
}
function readCodexTranscript(path) {
  const lines = [];
  for (const rawLine of readJsonl(path)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) lines.push(parsed);
    } catch {
      continue;
    }
  }
  const userFromEvents = lines.some(isUserMessageEvent);
  const actionsFromEvents = lines.some(isToolItemEvent);
  const turns = [];
  const push = (role, raw, stamp = {}) => {
    const text = stripInjectedMemory(raw).trim();
    if (text) turns.push({ role, content: text, ...stamp });
  };
  for (const line of lines) {
    if (isUserMessageEvent(line)) {
      push("user", contentText(line.payload?.item?.content), stampOf(line));
      continue;
    }
    if (isToolItemEvent(line)) {
      const action = toolItemAction(line.payload?.item ?? {});
      if (action) turns.push({ role: "action", content: action, ...stampOf(line) });
      continue;
    }
    if (line.type !== "response_item") continue;
    const p = line.payload;
    if (!p || typeof p !== "object") continue;
    if (p.type === "message") {
      if (p.role === "assistant") {
        if (p.channel === "analysis" || p.channel === "reasoning" || p.phase === "analysis" || p.phase === "reasoning")
          continue;
        push("assistant", contentText(p.content), stampOf(line));
      } else if (p.role === "user" && !userFromEvents) {
        push("user", fallbackUserText(p), stampOf(line));
      }
    } else if ((p.type === "function_call" || p.type === "custom_tool_call") && typeof p.name === "string") {
      if (actionsFromEvents && p.type === "custom_tool_call" && p.name === "exec") continue;
      const rawInput = p.type === "function_call" ? p.arguments : p.input;
      let input;
      try {
        input = JSON.parse(rawInput || "");
      } catch {
        input = void 0;
      }
      turns.push({ role: "action", content: actionLine(p.name, input), ...stampOf(line) });
    }
  }
  return turns;
}

// src/core/transcript-cursor.ts
function withTimestamp(turn, timestamp) {
  return timestamp ? { ...turn, timestamp } : turn;
}
function textFrom(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n");
}
function readCursorTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    let parsed;
    try {
      parsed = JSON.parse(rawLine);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const line = parsed;
    const role = line.message?.role ?? line.role ?? (line.type === "user" || line.type === "assistant" ? line.type : void 0);
    const content = line.message?.content ?? line.content;
    if (role === "user" || role === "assistant") {
      const text = stripInjectedMemory(textFrom(content)).trim();
      if (text) turns.push(withTimestamp({ role, content: text }, line.timestamp));
      if (role === "assistant" && Array.isArray(content)) {
        for (const block of content) {
          if (block?.type === "tool_use" && typeof block.name === "string") {
            turns.push(
              withTimestamp(
                { role: "action", content: actionLine(block.name, block.input) },
                line.timestamp
              )
            );
          }
        }
      }
    } else if (line.type === "tool_call" && typeof line.name === "string") {
      turns.push(
        withTimestamp({ role: "action", content: actionLine(line.name, line.args) }, line.timestamp)
      );
    }
  }
  return turns;
}

// src/core/transcript-antigravity.ts
function readAntigravityTranscript(path) {
  if (!path) return [];
  const turns = [];
  for (const line of readJsonl(path)) {
    try {
      const event = JSON.parse(line);
      const role = event.role ?? event.message?.role ?? event.type;
      const normalizedRole = role === "user" || role === "USER_INPUT" ? "user" : role === "assistant" || role === "model" || role === "PLANNER_RESPONSE" ? "assistant" : void 0;
      const content = event.content ?? event.text ?? event.message?.content ?? event.message?.text;
      const clean = typeof content === "string" ? stripInjectedMemory(content).trim() : "";
      if (normalizedRole && clean) {
        turns.push({
          role: normalizedRole,
          content: clean,
          ...event.timestamp ? { timestamp: event.timestamp } : {}
        });
      }
    } catch {
    }
  }
  return turns;
}

// src/core/transcript-copilot.ts
function readCopilotTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    try {
      const event = JSON.parse(rawLine);
      const role = event.type === "user.message" ? "user" : event.type === "assistant.message" ? "assistant" : void 0;
      const content = typeof event.data?.content === "string" ? stripInjectedMemory(event.data.content).trim() : "";
      if (!role || !content) continue;
      turns.push({ role, content, ...event.timestamp ? { timestamp: event.timestamp } : {} });
    } catch {
    }
  }
  return turns;
}

// src/core/transcript-grok.ts
import { existsSync as existsSync9, readFileSync as readFileSync11, readdirSync as readdirSync3 } from "fs";
import { homedir as homedir9 } from "os";
import { join as join19 } from "path";
var CHAT_HISTORY = "chat_history.jsonl";
function grokTranscriptPath(cwd, sessionId, grokHome = process.env.GROK_HOME || join19(homedir9(), ".grok")) {
  const sessionsDir = join19(grokHome, "sessions");
  const direct = join19(sessionsDir, encodeURIComponent(cwd), sessionId, CHAT_HISTORY);
  if (existsSync9(direct)) return direct;
  try {
    for (const candidate of readdirSync3(sessionsDir)) {
      const directory = join19(sessionsDir, candidate);
      if (readFileSync11(join19(directory, ".cwd"), "utf8").trim() === cwd) {
        return join19(directory, sessionId, CHAT_HISTORY);
      }
    }
  } catch {
  }
  return direct;
}
function readGrokTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    try {
      const event = JSON.parse(rawLine);
      if (event.type !== "user" && event.type !== "assistant") continue;
      if (event.type === "user" && typeof event.prompt_index !== "number") continue;
      const content = typeof event.content === "string" ? event.content : Array.isArray(event.content) ? event.content.filter((part) => part.type === "text").map((part) => part.text ?? "").join("\n") : "";
      const clean = stripInjectedMemory(content).trim();
      if (clean) turns.push({ role: event.type, content: clean });
      for (const toolCall of event.tool_calls ?? []) {
        if (!toolCall.name) continue;
        let input = toolCall.arguments;
        if (typeof input === "string") {
          try {
            input = JSON.parse(input);
          } catch {
          }
        }
        turns.push({ role: "action", content: actionLine(toolCall.name, input) });
      }
    } catch {
    }
  }
  return turns;
}

// src/core/transcript-devin.ts
import { existsSync as existsSync10 } from "fs";
import { createRequire } from "module";
import { homedir as homedir10 } from "os";
import { join as join20 } from "path";
function devinSessionDb(home = homedir10()) {
  return join20(home, ".local", "share", "devin", "cli", "sessions.db");
}
function parseDevinMessages(nodes) {
  const messages = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    try {
      const message = JSON.parse(node.chat_message);
      if (message.role !== "user" && message.role !== "assistant" || !message.content?.trim())
        continue;
      const content = stripInjectedMemory(message.content).trim();
      if (!content) continue;
      const id = message.message_id || `node:${node.node_id}`;
      messages.set(id, {
        index: messages.get(id)?.index ?? node.node_id,
        role: message.role,
        content
      });
    } catch {
    }
  }
  return [...messages.values()].sort((a, b) => a.index - b.index).map(({ role, content }) => ({ role, content }));
}
var requireBuiltin = createRequire(import.meta.url);
function loadSqlite() {
  try {
    return requireBuiltin("node:sqlite").DatabaseSync;
  } catch {
    return void 0;
  }
}
function readDevinTranscript(sessionId, dbPath = devinSessionDb()) {
  if (!sessionId) return [];
  const Database = loadSqlite();
  if (!Database) {
    diag("devin-cli", "sqlite_unavailable", { node: process.version, dbPath });
    return [];
  }
  if (!existsSync10(dbPath)) {
    diag("devin-cli", "session_db_missing", { dbPath });
    return [];
  }
  let db;
  try {
    db = new Database(dbPath, { readOnly: true });
    const rows = db.prepare(
      "SELECT node_id, chat_message FROM message_nodes WHERE session_id = ? ORDER BY node_id"
    ).all(sessionId);
    return parseDevinMessages(rows);
  } catch (error) {
    diag("devin-cli", "session_db_read_failed", { dbPath, error: String(error) });
    return [];
  } finally {
    try {
      db?.close();
    } catch {
    }
  }
}

// src/core/transcript-dcode.ts
var BLOCK_JOIN = "\n";
function contentText2(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.flatMap((block) => {
    if (typeof block === "string") return [block];
    if (!block || typeof block !== "object") return [];
    const text = block.text;
    return typeof text === "string" ? [text] : [];
  }).join(BLOCK_JOIN);
}
function readPyValue(s, i) {
  const skip = (j) => {
    while (j < s.length && /\s/.test(s[j])) j++;
    return j;
  };
  i = skip(i);
  if (i >= s.length) return null;
  const c = s[i];
  if (c === "'" || c === '"') {
    let out = "";
    let j = i + 1;
    while (j < s.length) {
      const ch = s[j];
      if (ch === "\\") {
        const esc = s[j + 1];
        if (esc === void 0) return null;
        if (esc === "n") out += "\n";
        else if (esc === "t") out += "	";
        else if (esc === "r") out += "\r";
        else if (esc === "x") {
          const hex = s.slice(j + 2, j + 4);
          if (!/^[0-9a-fA-F]{2}$/.test(hex)) return null;
          out += String.fromCharCode(parseInt(hex, 16));
          j += 4;
          continue;
        } else if (esc === "u") {
          const hex = s.slice(j + 2, j + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) return null;
          out += String.fromCharCode(parseInt(hex, 16));
          j += 6;
          continue;
        } else out += esc;
        j += 2;
        continue;
      }
      if (ch === c) return { value: out, end: j + 1 };
      out += ch;
      j++;
    }
    return null;
  }
  if (s.startsWith("True", i)) return { value: true, end: i + 4 };
  if (s.startsWith("False", i)) return { value: false, end: i + 5 };
  if (s.startsWith("None", i)) return { value: null, end: i + 4 };
  if (c === "[" || c === "{") {
    const isList = c === "[";
    const close = isList ? "]" : "}";
    const list = [];
    const obj = {};
    let j = skip(i + 1);
    if (s[j] === close) return { value: isList ? list : obj, end: j + 1 };
    for (; ; ) {
      const key = readPyValue(s, j);
      if (!key) return null;
      j = skip(key.end);
      if (isList) {
        list.push(key.value);
      } else {
        if (s[j] !== ":" || typeof key.value !== "string") return null;
        const val = readPyValue(s, j + 1);
        if (!val) return null;
        obj[key.value] = val.value;
        j = skip(val.end);
      }
      if (s[j] === ",") {
        j = skip(j + 1);
        if (s[j] === close) return { value: isList ? list : obj, end: j + 1 };
        continue;
      }
      if (s[j] === close) return { value: isList ? list : obj, end: j + 1 };
      return null;
    }
  }
  const num = /^-?\d+(\.\d+)?([eE][-+]?\d+)?/.exec(s.slice(i));
  if (num) return { value: Number(num[0]), end: i + num[0].length };
  return null;
}
function dcodeAssistantText(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[{") && !trimmed.startsWith("[ {")) return raw;
  const parsed = readPyValue(trimmed, 0);
  if (!parsed || readPyValue(trimmed, parsed.end) !== null) return "";
  if (!Array.isArray(parsed.value)) return "";
  return contentText2(parsed.value);
}
function readDcodeTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    if (!rawLine.trim()) continue;
    let parsed;
    try {
      parsed = JSON.parse(rawLine);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object") continue;
    const record = parsed;
    if (record.schema_version !== 1) continue;
    const role = record.role;
    const stamp = typeof record.timestamp === "string" && record.timestamp ? { timestamp: record.timestamp } : {};
    if (role === "user" || role === "assistant") {
      const text = stripInjectedMemory(contentText2(record.content)).trim();
      if (text) turns.push({ role, content: text, ...stamp });
    } else if (role === "tool" && typeof record.name === "string" && record.name.trim()) {
      turns.push({ role: "action", content: actionLine(record.name, record.content), ...stamp });
    }
  }
  return turns;
}

// src/core/transcript-qwen.ts
var HOOK_CONTEXT_PART_RE = /^\s*<qwen:user-prompt-submit-context>[\s\S]*<\/qwen:user-prompt-submit-context>\s*$/;
function isWholeHookContextPart(part) {
  return typeof part.text === "string" && HOOK_CONTEXT_PART_RE.test(part.text);
}
function isRealUser(line) {
  if (typeof line.provenance === "string") return line.provenance === "real_user";
  if (line.provenance !== void 0) return false;
  const isSubagentEnvelope = line.agentId !== void 0 || line.isSidechain !== void 0;
  if (!isSubagentEnvelope) return false;
  return line.subtype === void 0 || line.subtype === "mid_turn_user_message";
}
function renderLine2(parts, type) {
  if (!Array.isArray(parts)) return [];
  const last = parts.length > 1 ? parts[parts.length - 1] : void 0;
  const dropLast = !!last && typeof last === "object" && isWholeHookContextPart(last) ? parts.length - 1 : -1;
  const texts = [];
  const actions = [];
  for (const [i, part] of parts.entries()) {
    if (!part || typeof part !== "object") continue;
    if (i === dropLast) continue;
    if (part.thought === true) continue;
    if (typeof part.text === "string") {
      const text = stripInjectedMemory(part.text).trim();
      if (text) texts.push(text);
    } else if (part.functionCall && typeof part.functionCall.name === "string") {
      actions.push({
        role: "action",
        content: actionLine(part.functionCall.name, part.functionCall.args)
      });
    }
  }
  const out = [];
  const joined = texts.join("\n").trim();
  if (joined) out.push({ role: type, content: joined });
  out.push(...actions);
  return out;
}
function readQwenTranscript(path) {
  const turns = [];
  try {
    collectQwenTurns(path, turns);
  } catch (err) {
    log.warn("qwen-code", "transcript read failed \u2014 retaining what was parsed", {
      path,
      turns: turns.length,
      error: err instanceof Error ? err.message : String(err)
    });
  }
  return turns;
}
function collectQwenTurns(path, turns) {
  for (const rawLine of readJsonl(path)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const line = parsed;
    if (line.type !== "user" && line.type !== "assistant") continue;
    if (line.type === "user" && !isRealUser(line)) continue;
    if (typeof line.message !== "object" || line.message === null) continue;
    const sp = line.systemPayload;
    if (line.type === "user" && sp && typeof sp === "object" && typeof sp.hookContext === "string" && typeof sp.displayText === "string") {
      const content = stripInjectedMemory(sp.displayText).trim();
      if (content) {
        const turn = { role: "user", content };
        if (typeof line.timestamp === "string") turn.timestamp = line.timestamp;
        turns.push(turn);
      }
      continue;
    }
    for (const rendered of renderLine2(line.message.parts, line.type)) {
      const turn = { role: rendered.role, content: rendered.content };
      if (typeof line.timestamp === "string") turn.timestamp = line.timestamp;
      turns.push(turn);
    }
  }
}

// src/core/transcript-droid.ts
function renderContent(content, role) {
  if (!Array.isArray(content)) return [];
  const texts = [];
  const actions = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const b = block;
    if (b.type === "text" && typeof b.text === "string") {
      const text = stripInjectedMemory(b.text).trim();
      if (text) texts.push(text);
    } else if (b.type === "tool_use" && typeof b.name === "string") {
      actions.push({ role: "action", content: actionLine(b.name, b.input) });
    }
  }
  const out = [];
  const joined = texts.join("\n").trim();
  if (joined) out.push({ role, content: joined });
  out.push(...actions);
  return out;
}
function readDroidTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    if (!rawLine.trim()) continue;
    let parsed;
    try {
      parsed = JSON.parse(rawLine);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object") continue;
    const line = parsed;
    if (line.type !== "message" || !line.message || typeof line.message !== "object") continue;
    const message = line.message;
    const role = message.role;
    if (role !== "user" && role !== "assistant") continue;
    if (message.visibility === "user_only" || message.visibility === "llm_only") continue;
    const stamp = typeof line.timestamp === "string" && line.timestamp ? { timestamp: line.timestamp } : {};
    turns.push(...renderContent(message.content, role).map((turn) => ({ ...turn, ...stamp })));
  }
  return turns;
}

// src/core/transcript-zcode.ts
import { readFileSync as readFileSync12 } from "fs";
function messageText(content) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content.filter((block) => block && typeof block === "object" && typeof block.text === "string").map((block) => block.text.trim()).filter(Boolean).join("\n").trim();
}
function readZcodeTranscript(path) {
  if (!path) return [];
  let body;
  try {
    body = readFileSync12(path, "utf8");
  } catch {
    return [];
  }
  const turns = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const record = parsed;
    const message = typeof record.message === "object" && record.message !== null ? record.message : void 0;
    const role = typeof message?.role === "string" ? message.role : record.type;
    if (role !== "user" && role !== "assistant") continue;
    const content = stripInjectedMemory(messageText(message?.content)).trim();
    if (!content) continue;
    turns.push({
      role,
      content,
      ...typeof record.timestamp === "string" ? { timestamp: record.timestamp } : {}
    });
  }
  return turns;
}
function zcodeAssistantText(path) {
  if (!path) return "";
  return readZcodeTranscript(path).filter((turn) => turn.role === "assistant").at(-1)?.content ?? "";
}

// src/core/transcript-kimi.ts
import { existsSync as existsSync11, readdirSync as readdirSync4 } from "fs";
import { homedir as homedir11 } from "os";
import { join as join21 } from "path";
var HARNESS = "kimi-code";
var SESSIONS_DIR = "sessions";
var AGENTS_DIR = "agents";
var WIRE_LOG = "wire.jsonl";
var SESSION_PREFIX = "session_";
var MAIN_AGENT = "main";
var MAX_SESSION_CHARS = 32 * 1024 * 1024;
function kimiSessionDir(sessionId, kimiHome2 = process.env.KIMI_CODE_HOME || join21(homedir11(), ".kimi-code")) {
  const name = sessionId.startsWith(SESSION_PREFIX) ? sessionId : `${SESSION_PREFIX}${sessionId}`;
  const sessions = join21(kimiHome2, SESSIONS_DIR);
  try {
    for (const workspace of readdirSync4(sessions, { withFileTypes: true })) {
      if (!workspace.isDirectory()) continue;
      const candidate = join21(sessions, workspace.name, name);
      if (existsSync11(join21(candidate, AGENTS_DIR))) return candidate;
    }
  } catch {
  }
  diag(HARNESS, "session_dir_missing", { sessions, session: name });
  return void 0;
}
function stampOf2(event) {
  if (typeof event.time !== "number") return {};
  const at = new Date(event.time);
  return Number.isNaN(at.getTime()) ? {} : { timestamp: at.toISOString() };
}
function kimiPromptText(input) {
  if (!Array.isArray(input)) return "";
  return input.filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n");
}
function readKimiWire(events) {
  const turns = [];
  let step;
  const flushStep = () => {
    if (!step) return;
    const content = stripInjectedMemory(step.texts.join("\n")).trim();
    if (content) turns.push({ role: "assistant", content, ...step.stamp });
    step = void 0;
  };
  for (const event of events || []) {
    if (!event || typeof event !== "object") continue;
    const stamp = stampOf2(event);
    if (event.type === "turn.prompt") {
      flushStep();
      if (event.origin?.kind !== "user") continue;
      const content = stripInjectedMemory(kimiPromptText(event.input)).trim();
      if (content) turns.push({ role: "user", content, ...stamp });
      continue;
    }
    if (event.type !== "context.append_loop_event") continue;
    const loop = event.event;
    if (!loop || typeof loop !== "object") continue;
    if (loop.type === "content.part") {
      if (loop.part?.type !== "text" || typeof loop.part.text !== "string") continue;
      const uuid = typeof loop.stepUuid === "string" ? loop.stepUuid : "";
      if (step && step.uuid !== uuid) flushStep();
      if (!step) step = { uuid, texts: [], stamp };
      step.texts.push(loop.part.text);
    } else if (loop.type === "tool.call") {
      flushStep();
      if (typeof loop.name !== "string" || !loop.name) continue;
      turns.push({ role: "action", content: actionLine(loop.name, loop.args), ...stamp });
    }
  }
  flushStep();
  return turns;
}
function agentIds(sessionDir) {
  try {
    return readdirSync4(join21(sessionDir, AGENTS_DIR), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(byAgentId);
  } catch {
    return [];
  }
}
function byAgentId(a, b) {
  if (a === b) return 0;
  if (a === MAIN_AGENT) return -1;
  if (b === MAIN_AGENT) return 1;
  const indexA = agentIndex(a);
  const indexB = agentIndex(b);
  return indexA === indexB ? a.localeCompare(b) : indexA - indexB;
}
function agentIndex(id) {
  const suffix = Number(id.slice(id.lastIndexOf("-") + 1));
  return Number.isFinite(suffix) ? suffix : Number.MAX_SAFE_INTEGER;
}
function parseEvent(rawLine) {
  const trimmed = rawLine.trim();
  if (!trimmed) return void 0;
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return void 0;
  }
  return typeof parsed === "object" && parsed !== null ? parsed : void 0;
}
function readKimiTranscript(path) {
  const turns = [];
  let remaining = MAX_SESSION_CHARS;
  for (const agentId of agentIds(path)) {
    const wire = join21(path, AGENTS_DIR, agentId, WIRE_LOG);
    const events = [];
    for (const rawLine of readJsonl(wire)) {
      remaining -= rawLine.length;
      if (remaining < 0) break;
      const event = parseEvent(rawLine);
      if (event) events.push(event);
    }
    for (const turn of readKimiWire(events)) turns.push(turn);
    if (remaining < 0) {
      log.warn(HARNESS, "session exceeds the wire-log budget \u2014 later agents were not read", {
        sessionDir: path,
        stoppedAt: wire
      });
      break;
    }
  }
  return turns;
}

// src/core/transcript-workbuddy.ts
function messageText2(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((b) => b && typeof b.text === "string").map((b) => b.text).join("\n");
}
var USER_QUERY_RE = /^\s*<user_query>([\s\S]*?)<\/user_query>\s*(?:<image_local_path>[\s\S]*?<\/image_local_path>\s*)?$/;
function unwrapUserQuery(text) {
  const match = USER_QUERY_RE.exec(text);
  return (match ? match[1] : text).trim();
}
function isSyntheticUserText2(text) {
  const s = text.trimStart();
  return s.startsWith("<cb_summary>") || s.startsWith("<conversation_history_summary>") || s.startsWith("Use the TaskOutput tool ");
}
function parseArgs2(raw) {
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function stampOf3(line) {
  return typeof line.timestamp === "number" ? { timestamp: new Date(line.timestamp).toISOString() } : {};
}
function readWorkbuddyTranscript(path) {
  const turns = [];
  for (const rawLine of readJsonl(path)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const line = parsed;
    const stamp = stampOf3(line);
    if (line.type === "message") {
      if (line.role !== "user" && line.role !== "assistant") continue;
      let text = stripInjectedMemory(messageText2(line.content)).trim();
      if (!text) continue;
      if (line.role === "user") {
        if (isSyntheticUserText2(text)) continue;
        text = unwrapUserQuery(text);
        if (!text) continue;
      }
      turns.push({ role: line.role, content: text, ...stamp });
    } else if (line.type === "function_call" && typeof line.name === "string") {
      turns.push({
        role: "action",
        content: actionLine(line.name, parseArgs2(line.arguments)),
        ...stamp
      });
    }
  }
  return turns;
}

// src/core/transcript-codebuddy-ide.ts
import { readFileSync as readFileSync13 } from "fs";
import { basename as basename3, dirname as dirname12, join as join22 } from "path";
var IDE_CONTEXT_RE = /<(user_info|git_status|additional_data|system_reminder)\b[\s\S]*?<\/\1>/g;
function readJson(path) {
  try {
    return JSON.parse(readFileSync13(path, "utf8"));
  } catch {
    return void 0;
  }
}
function ideUserText(raw) {
  let text = stripInjectedMemory(raw).replace(IDE_CONTEXT_RE, "").trim();
  if (!text || isSyntheticUserText2(text)) return "";
  return unwrapUserQuery(text).trim();
}
function readCodebuddyIdeTranscript(indexPath) {
  const index = readJson(indexPath);
  const entries = index?.messages;
  if (!Array.isArray(entries)) return [];
  const messagesDir = join22(dirname12(indexPath), "messages");
  const turns = [];
  for (const entry of entries) {
    const id = entry?.id;
    if (typeof id !== "string") continue;
    const file = readJson(join22(messagesDir, `${id}.json`));
    const encoded = file?.message;
    if (typeof encoded !== "string") continue;
    let inner;
    try {
      inner = JSON.parse(encoded);
    } catch {
      continue;
    }
    const role = typeof inner.role === "string" ? inner.role : file?.role;
    const isUser = role === "user";
    const isAssistant = role === "assistant";
    const stamp = typeof file?.createdAt === "string" ? { timestamp: file.createdAt } : {};
    const blocks = Array.isArray(inner.content) ? inner.content : [];
    const texts = [];
    const calls = [];
    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      const { type, text, toolName, args } = block;
      if (type === "text" && typeof text === "string") texts.push(text);
      else if (type === "tool-call" && typeof toolName === "string")
        calls.push({ name: toolName, args });
    }
    if (texts.length) {
      const raw = texts.join("\n");
      if (isUser) {
        const text = ideUserText(raw);
        if (text) turns.push({ role: "user", content: text, ...stamp });
      } else if (isAssistant) {
        const text = stripInjectedMemory(raw).trim();
        if (text) turns.push({ role: "assistant", content: text, ...stamp });
      }
    }
    for (const call of calls) {
      turns.push({ role: "action", content: actionLine(call.name, call.args), ...stamp });
    }
  }
  return turns;
}
function readCodebuddyTranscript(path) {
  return basename3(path) === "index.json" ? readCodebuddyIdeTranscript(path) : readWorkbuddyTranscript(path);
}

// src/harness/hook-lifecycle.ts
var cursorCwd = (ev) => ev.cwd ?? ev.workspace_root ?? (Array.isArray(ev.workspace_roots) ? ev.workspace_roots[0] : void 0);
var claudePrompt = {
  harness: "claude-code",
  parse: (ev) => ({
    prompt: ev.prompt,
    cwd: ev.cwd,
    sessionId: ev.session_id
  }),
  emit: (context, notice) => ({
    ...notice ? { systemMessage: notice } : {},
    hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context }
  })
};
var codexPrompt = {
  ...claudePrompt,
  harness: "codex",
  parse: (ev) => ({
    prompt: ev.prompt ?? ev.user_prompt,
    cwd: ev.cwd,
    sessionId: ev.session_id
  })
};
var dcodePrompt = {
  ...claudePrompt,
  harness: "dcode"
};
var droidPrompt = {
  ...claudePrompt,
  harness: "factory-droid"
};
var qwenPrompt = {
  ...claudePrompt,
  harness: "qwen-code",
  parse: (ev) => ({
    prompt: ev.submitted_prompt,
    cwd: ev.cwd,
    sessionId: ev.session_id
  })
};
var zcodeSessionId = (ev) => ev.session_id ?? ev.sessionId;
var antigravityCwd = (ev) => Array.isArray(ev.workspacePaths) ? ev.workspacePaths[0] : void 0;
var antigravityPrompt = {
  harness: "antigravity-cli",
  requireCwd: true,
  parse: (ev) => ({
    // Antigravity's PreInvocation payload deliberately omits the prompt. Its transcript is already
    // persisted at that point, so recover the latest real user turn from the supplied JSONL path.
    prompt: readAntigravityTranscript(ev.transcriptPath).filter((turn) => turn.role === "user").at(-1)?.content,
    cwd: antigravityCwd(ev),
    sessionId: ev.conversationId
  }),
  emit: (context) => ({ injectSteps: context ? [{ ephemeralMessage: context }] : [] })
};
var cursorPrompt = {
  harness: "cursor-cli",
  parse: (ev) => ({
    prompt: ev.prompt ?? ev.user_prompt,
    cwd: cursorCwd(ev),
    sessionId: ev.conversation_id ?? ev.session_id
  }),
  emit: (context) => ({ continue: true, additional_context: context })
};
var copilotPrompt = {
  harness: "copilot-cli",
  parse: (ev) => ({
    prompt: ev.prompt,
    cwd: ev.cwd,
    sessionId: ev.sessionId
  }),
  emit: (context, _notice, ev) => ({
    // Copilot's userPromptTransformed hook replaces model-facing content rather than appending
    // hook context. Preserve its transformed prompt and add the shared Hindsight injection.
    modifiedTransformedPrompt: `${ev?.transformedPrompt ?? ""}

${context}`.trim()
  })
};
var devinCwd = () => process.env.DEVIN_PROJECT_DIR || process.cwd();
var devinPrompt = {
  harness: "devin-cli",
  requireCwd: true,
  parse: (ev) => ({
    prompt: ev.prompt,
    cwd: devinCwd(),
    sessionId: ev.session_id
  }),
  emit: (context) => ({
    hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context }
  })
};
var standardSessionStart = (harness) => ({
  harness,
  parse: (ev) => ({
    cwd: ev.cwd,
    sessionId: ev.session_id
  }),
  emit: (out) => ({
    ...out.systemMessage ? { systemMessage: out.systemMessage } : {},
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      ...out.additionalContext ? { additionalContext: out.additionalContext } : {}
    }
  })
});
var genieSessionStart = (harness) => {
  const base = standardSessionStart(harness);
  return {
    ...base,
    parse: (ev) => ({
      cwd: ev.cwd || process.env.CODEBUDDY_PROJECT_DIR,
      sessionId: ev.session_id
    }),
    emit: (out) => ({ ...base.emit(out), suppressOutput: true })
  };
};
var geniePrompt = (harness) => ({
  ...claudePrompt,
  harness,
  emit: (context, notice, ev) => ({
    ...claudePrompt.emit(context, notice, ev),
    suppressOutput: true
  })
});
var genieRetain = (harness, readTranscript) => ({
  hostTimeoutSec: 60,
  harness,
  parse: (ev) => ({
    sessionId: ev.session_id,
    transcriptPath: ev.transcript_path,
    cwd: ev.cwd
  }),
  readTranscript
});
var notGrokHosted = () => !process.env.GROK_HOOK_EVENT;
var HOOK_HARNESSES = {
  "claude-code": {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "claude-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "claude-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "claude-stop-hook.js", timeout: 60 }
    },
    sessionStart: { ...standardSessionStart("claude-code"), accept: notGrokHosted },
    prompt: { ...claudePrompt, accept: notGrokHosted },
    retain: {
      hostTimeoutSec: 60,
      harness: "claude-code",
      accept: notGrokHosted,
      parse: (ev) => ({
        sessionId: ev.session_id,
        transcriptPath: ev.transcript_path,
        cwd: ev.cwd
      })
    }
  },
  codex: {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "codex-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "codex-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "codex-stop-hook.js", timeout: 60 }
    },
    sessionStart: standardSessionStart("codex"),
    prompt: codexPrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "codex",
      parse: (ev) => ({
        sessionId: ev.session_id,
        transcriptPath: ev.transcript_path,
        cwd: ev.cwd
      }),
      readTranscript: readCodexTranscript
    }
  },
  dcode: {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "dcode-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "dcode-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "dcode-stop-hook.js", timeout: 60 }
    },
    sessionStart: standardSessionStart("dcode"),
    prompt: dcodePrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "dcode",
      parse: (ev) => ({
        sessionId: ev.session_id,
        transcriptPath: ev.transcript_path,
        cwd: ev.cwd,
        lastAssistantMessage: ev.last_assistant_message
      }),
      readTranscript: readDcodeTranscript,
      readLastMessage: dcodeAssistantText
    }
  },
  "antigravity-cli": {
    configStyle: "flat",
    install: {
      // PreInvocation is Antigravity's only lifecycle point that can inject context. Its first
      // invocation also performs the SessionStart responsibilities through runHook's seed guard.
      sessionStart: { event: "PreInvocation", entry: "antigravity-hook.js", timeout: 30 },
      prompt: { event: "PreInvocation", entry: "antigravity-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "antigravity-stop-hook.js", timeout: 30 }
    },
    sessionStart: {
      harness: "antigravity-cli",
      parse: (ev) => ({
        cwd: antigravityCwd(ev),
        sessionId: ev.conversationId
      }),
      emit: () => ({})
    },
    prompt: antigravityPrompt,
    retain: {
      hostTimeoutSec: 30,
      harness: "antigravity-cli",
      parse: (ev) => ({
        sessionId: ev.conversationId,
        transcriptPath: ev.transcriptPath,
        cwd: antigravityCwd(ev)
      }),
      readTranscript: readAntigravityTranscript
    }
  },
  "cursor-cli": {
    configStyle: "flat",
    install: {
      sessionStart: { event: "sessionStart", entry: "cursor-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "beforeSubmitPrompt", entry: "cursor-hook.js" },
      stop: { event: "stop", entry: "cursor-stop-hook.js", timeout: 30 }
    },
    sessionStart: {
      harness: "cursor-cli",
      parse: (ev) => ({
        cwd: cursorCwd(ev),
        sessionId: ev.conversation_id ?? ev.session_id
      }),
      emit: (out) => ({
        ...out.additionalContext ? { additional_context: out.additionalContext } : {}
      })
    },
    prompt: cursorPrompt,
    retain: {
      hostTimeoutSec: 30,
      harness: "cursor-cli",
      parse: (ev) => ({
        sessionId: ev.conversation_id ?? ev.session_id,
        transcriptPath: ev.transcript_path,
        cwd: cursorCwd(ev)
      }),
      readTranscript: readCursorTranscript
    }
  },
  "copilot-cli": {
    configStyle: "flat",
    install: {
      sessionStart: { event: "sessionStart", entry: "copilot-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "userPromptTransformed", entry: "copilot-hook.js", timeout: 30 },
      stop: { event: "agentStop", entry: "copilot-stop-hook.js", timeout: 60 }
    },
    sessionStart: {
      harness: "copilot-cli",
      parse: (ev) => ({
        cwd: ev.cwd,
        sessionId: ev.sessionId
      }),
      // Copilot CLI's SessionStart response only has model-facing `additionalContext`; unlike
      // Claude/Cursor it has no supported in-TUI system-message/banner channel. Keep memory
      // quiet rather than auto-submitting a synthetic prompt or showing an OS notification. When
      // Copilot exposes a real TUI extension point, add the banner there without changing this
      // shared lifecycle output.
      emit: (out) => ({
        ...out.additionalContext ? { additionalContext: out.additionalContext } : {}
      })
    },
    prompt: copilotPrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "copilot-cli",
      parse: (ev) => ({
        sessionId: ev.sessionId,
        transcriptPath: ev.transcriptPath,
        cwd: ev.cwd
      }),
      readTranscript: readCopilotTranscript
    }
  },
  "devin-cli": {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "devin-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "devin-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "devin-stop-hook.js", timeout: 60 }
    },
    sessionStart: {
      harness: "devin-cli",
      parse: (ev) => ({ cwd: devinCwd(), sessionId: ev.session_id }),
      emit: (out) => ({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          ...out.additionalContext ? { additionalContext: out.additionalContext } : {}
        }
      })
    },
    prompt: devinPrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "devin-cli",
      parse: (ev) => {
        const sessionId = ev.session_id;
        return {
          sessionId,
          // RetainHook calls the supplied reader with transcriptPath; Devin's reader uses its
          // session id because the CLI persists conversations in sessions.db rather than a file.
          transcriptPath: sessionId,
          cwd: devinCwd()
        };
      },
      readTranscript: readDevinTranscript
    }
  },
  "grok-build": {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "grok-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "grok-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "grok-stop-hook.js", timeout: 60 }
    },
    // Grok hands the model `additionalContext` from TOOL hooks only: SessionStart is observe-only
    // and UserPromptSubmit can only block (#5467). Both stash their context instead, and the
    // prompt entry, also registered on PostToolUse, delivers it beside the next tool result.
    additionalHooks: [{ event: "PostToolUse", entry: "grok-hook.js", timeout: 30 }],
    sessionStart: {
      ...standardSessionStart("grok-build"),
      // Grok's wire envelope is camelCase, unlike Claude's similarly named hook events.
      parse: (ev) => ({
        cwd: ev.cwd,
        sessionId: ev.sessionId
      }),
      deferContextToToolHook: true
    },
    prompt: {
      ...claudePrompt,
      harness: "grok-build",
      toolHook: {
        // Grok names the event twice: snake_case `hookEventName`, plus a Claude-named alias.
        accept: (ev) => ev.hookEventName === "post_tool_use" || ev.hook_event_name === "PostToolUse",
        emit: (context) => ({
          hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: context }
        })
      },
      parse: (ev) => ({
        prompt: ev.prompt,
        cwd: ev.cwd,
        sessionId: ev.sessionId
      })
    },
    retain: {
      hostTimeoutSec: 60,
      harness: "grok-build",
      parse: (ev) => ({
        sessionId: ev.sessionId,
        transcriptPath: typeof ev.cwd === "string" && typeof ev.sessionId === "string" ? grokTranscriptPath(ev.cwd, ev.sessionId) : void 0,
        cwd: ev.cwd
      }),
      readTranscript: readGrokTranscript
    }
  },
  "qwen-code": {
    configStyle: "nested",
    timeoutUnit: "milliseconds",
    // TIMEOUTS ARE MILLISECONDS HERE, not seconds like every other harness in this table: Qwen's
    // hookRunner does `setTimeout(..., hookConfig.timeout ?? DEFAULT_HOOK_TIMEOUT)` with
    // DEFAULT_HOOK_TIMEOUT = 60_000 ("Timeout in milliseconds, default 60000"). Writing 30/60
    // registers 30ms/60ms hooks, which die before a Node process starts — and Qwen spawns hooks
    // `detached` and terminates the whole process TREE on timeout, so the retain is genuinely lost
    // rather than merely orphaned. `retain.hostTimeoutSec` below stays SECONDS, as its name says;
    // these two numbers are the same budget in different units for this harness alone.
    // The prompt timeout must also stay above core/config.ts's DEFAULT_REFLECT_TIMEOUT_MS.
    install: {
      sessionStart: { event: "SessionStart", entry: "qwen-sessionstart-hook.js", timeout: 3e4 },
      prompt: { event: "UserPromptSubmit", entry: "qwen-hook.js", timeout: 3e4 },
      stop: { event: "Stop", entry: "qwen-stop-hook.js", timeout: 6e4 }
    },
    sessionStart: standardSessionStart("qwen-code"),
    prompt: qwenPrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "qwen-code",
      parse: (ev) => ({
        sessionId: ev.session_id,
        // Qwen supplies the path, but as the EMPTY STRING (not null, not absent) when chat
        // recording is off — runRetainHook's `if (!transcriptPath) return` already covers that.
        transcriptPath: ev.transcript_path,
        cwd: ev.cwd
      }),
      readTranscript: readQwenTranscript
    }
  },
  "factory-droid": {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "droid-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "droid-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "droid-stop-hook.js", timeout: 60 }
    },
    // Droid emits Notification(idle_prompt), not Stop, after user cancellation. Reusing the
    // idempotent retain entry point captures that final partial turn; its event gate ignores every
    // other notification type before config or daemon work begins.
    additionalHooks: [{ event: "Notification", entry: "droid-stop-hook.js", timeout: 60 }],
    sessionStart: standardSessionStart("factory-droid"),
    prompt: droidPrompt,
    retain: {
      hostTimeoutSec: 60,
      harness: "factory-droid",
      accept: (ev) => ev.hook_event_name === "Stop" || ev.hook_event_name === "Notification" && ev.notification_type === "idle_prompt",
      parse: (ev) => ({
        sessionId: ev.session_id,
        transcriptPath: ev.transcript_path,
        cwd: ev.cwd
      }),
      readTranscript: readDroidTranscript
    }
  },
  /**
   * ZCode (Z.ai's GLM coding agent) embeds the Claude Code agent runtime, so its hook PROTOCOL is
   * Claude's — `prompt`/`cwd` in, `hookSpecificOutput.additionalContext` + `systemMessage` out —
   * with `sessionId` accepted alongside `session_id`, which its Stop payload sends instead.
   *
   * What is not Claude's is the TRANSCRIPT, and that is the whole of the difference here. ZCode
   * keeps no durable session file: `Stop` carries the reply in `responseText` plus a temp,
   * assistant-only transcript it deletes as soon as the hook returns, and no user prompt at all.
   * So this is the one harness that retains from the plugin's own journal (core/turn-journal.ts) —
   * the prompt hook appends the user turn, `journal.assistantText` closes it with the reply — and
   * everything downstream (cursor, append, stamping) sees the same full conversation as any host
   * transcript.
   */
  zcode: {
    configStyle: "process",
    // ZCode's `timeoutMs`, so MILLISECONDS — see the qwen-code note above for the same trap. The
    // prompt budget must stay above core/config.ts's DEFAULT_REFLECT_TIMEOUT_MS.
    timeoutUnit: "milliseconds",
    install: {
      sessionStart: { event: "SessionStart", entry: "zcode-sessionstart-hook.js", timeout: 3e4 },
      prompt: { event: "UserPromptSubmit", entry: "zcode-hook.js", timeout: 3e4 },
      stop: { event: "Stop", entry: "zcode-stop-hook.js", timeout: 6e4 }
    },
    sessionStart: {
      ...standardSessionStart("zcode"),
      parse: (ev) => ({ cwd: ev.cwd, sessionId: zcodeSessionId(ev) })
    },
    prompt: {
      ...claudePrompt,
      harness: "zcode",
      journalPrompt: true,
      parse: (ev) => ({
        prompt: ev.prompt ?? ev.user_prompt,
        cwd: ev.cwd,
        sessionId: zcodeSessionId(ev)
      })
    },
    retain: {
      hostTimeoutSec: 60,
      harness: "zcode",
      // No transcriptPath: the journal supplies it (see `journal` below).
      parse: (ev) => ({ sessionId: zcodeSessionId(ev), cwd: ev.cwd }),
      journal: {
        // `responseText` is the full reply and is what ZCode sends in practice. The ephemeral
        // transcript is the fallback when it is absent, and `responsePreview` — which is
        // TRUNCATED — is the last resort, preferred only over losing the turn entirely.
        assistantText: (ev) => (ev.responseText || zcodeAssistantText(ev.transcript_path) || ev.responsePreview || "").trim()
      }
    }
  },
  /**
   * TraeCode (TRAE CN's agent) also speaks Claude Code's hook protocol — `prompt`/`cwd`/`session_id`
   * in, `hookSpecificOutput.additionalContext` + `systemMessage` out — with registrations nested
   * under the top-level `hooks` key of `~/.trae-cn/hooks.json` (unlike Factory Droid, whose event
   * map IS the file) and a `version` field the host writes and expects.
   *
   * Like ZCode, what it does not have is a TRANSCRIPT: sessions live in an encrypted local DB or
   * the cloud and no `transcript_path` is ever supplied, so this is the second harness that retains
   * from the plugin's own journal (core/turn-journal.ts) — the prompt hook appends the user turn,
   * and Stop's `last_assistant_message` (the full reply) plays the role ZCode's `responseText`
   * plays: `journal.assistantText` closes the turn with it.
   */
  traecode: {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "traecode-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "traecode-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "traecode-stop-hook.js", timeout: 60 }
    },
    sessionStart: {
      ...standardSessionStart("traecode"),
      // Trae launches USER-level MCP servers from the Electron process's cwd (home), where an
      // optInOnly config self-disables and the tools vanish. Each repo's own workspace file fixes
      // it — kept current here, once memory is confirmed live for the repo, along with the
      // workspace's per-server enable switch (seeded into Trae's storage DB,
      // core/traecode-mcp.ts). The returned hint (global gate off, or an unseedable switch)
      // rides the session banner.
      ensureMcpRegistration: (cwd) => ensureTraecodeWorkspaceMcp(cwd)
    },
    prompt: {
      ...claudePrompt,
      harness: "traecode",
      journalPrompt: true,
      // TraeCode's UserPromptSubmit payload carries `prompt` exactly like Claude Code's.
      parse: (ev) => ({
        prompt: ev.prompt,
        cwd: ev.cwd,
        sessionId: ev.session_id
      })
    },
    retain: {
      hostTimeoutSec: 60,
      harness: "traecode",
      // No transcriptPath: the journal supplies it (see `journal` below).
      parse: (ev) => ({
        sessionId: ev.session_id,
        cwd: ev.cwd
      }),
      journal: {
        // `last_assistant_message` is the full reply — TraeCode's `responseText`.
        assistantText: (ev) => (ev.last_assistant_message ?? "").trim()
      }
    }
  },
  "kimi-code": {
    // Kimi's ~/.kimi-code/config.toml takes a FLAT [[hooks]] array whose entries are validated by a
    // strict 4-key schema (event/matcher/command/timeout). Neither JSON style can express it, and a
    // fifth key drops EVERY hook in the file at warning severity, so its installer writes the block
    // itself (the grok-build pattern) rather than going through mergeHarnessHooks.
    configStyle: "toml-array",
    install: {
      // Timeouts are SECONDS here (integer 1-600, default 30) — the same unit as every other
      // supported host, and the opposite of qwen-code's identically named field.
      sessionStart: { event: "SessionStart", entry: "kimi-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "kimi-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "kimi-stop-hook.js", timeout: 60 }
    },
    sessionStart: {
      harness: "kimi-code",
      parse: (ev) => ({
        cwd: ev.cwd,
        sessionId: ev.session_id
      }),
      // Kimi runs SessionStart hooks for their side effects only: it awaits the trigger and drops
      // the result, so nothing emitted here can reach the model or the terminal. Installed for the
      // seed/daemon/session-root work runSessionStartHook does, and silent like antigravity-cli's.
      emit: () => ({})
    },
    prompt: {
      harness: "kimi-code",
      parse: (ev) => ({
        // A block array, not a string — the same shape as the wire log's `turn.prompt.input`.
        prompt: kimiPromptText(ev.prompt),
        cwd: ev.cwd,
        sessionId: ev.session_id
      }),
      // Kimi has no additionalContext: a top-level `message` is the injection channel, which the
      // CLI wraps as <hook_result hook_event="UserPromptSubmit"> and appends to the conversation.
      // `notice` has no banner channel to reach (the copilot-cli precedent), but it cannot simply
      // be dropped: when a hook's stdout parses to JSON carrying no message, Kimi falls back to
      // injecting the RAW STDOUT, so an empty `{}` would put a literal "{}" in front of the model.
      // Emitting the notice on the notice-only turn is what keeps that from ever happening.
      emit: (context, notice) => ({ message: context || notice })
    },
    retain: {
      hostTimeoutSec: 60,
      harness: "kimi-code",
      parse: (ev) => {
        const sessionId = ev.session_id;
        return {
          sessionId,
          // Kimi's Stop payload carries no transcript path — its hook feature has no such field at
          // all — so resolve the session's own directory from the id, as grok-build does. The
          // reader takes that DIRECTORY and reads every agent's wire.jsonl beneath it.
          transcriptPath: sessionId ? kimiSessionDir(sessionId) : void 0,
          cwd: ev.cwd
        };
      },
      readTranscript: readKimiTranscript
    }
  },
  /**
   * WorkBuddy (Tencent's AI workbench) keeps a durable transcript at
   * ~/.workbuddy/projects/<cwd-encoded>/<uuid>.jsonl and speaks Claude's hook protocol —
   * `session_id` / `transcript_path` / `cwd` in, hookSpecificOutput + systemMessage out — apart
   * from the two quirks genieSessionStart/geniePrompt handle. The other host-specific piece is the
   * transcript SCHEMA: `type:"message"` records carrying top-level `role`/`content`, which
   * core/transcript-workbuddy.ts normalizes. Its Stop payload fills `transcript_path` for real (the
   * engine's own getHookTranscriptPath), so it retains through `readTranscript` like every other
   * file-backed host rather than the journal ZCode needs.
   * CodeBuddy Code ships the same @genie/agent-cli engine and reuses this reader (see `codebuddy`).
   */
  workbuddy: {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "workbuddy-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "workbuddy-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "workbuddy-stop-hook.js", timeout: 60 }
    },
    sessionStart: genieSessionStart("workbuddy"),
    prompt: geniePrompt("workbuddy"),
    retain: genieRetain("workbuddy", readWorkbuddyTranscript)
  },
  /**
   * CodeBuddy — the same `@genie/agent-cli` engine WorkBuddy ships, running under its own product
   * config (`~/.codebuddy`; WorkBuddy only renames the home folder). Hook names and payload shape
   * are identical, so this spec differs from `workbuddy` in the files the installer writes, the
   * harness name stamped on what it retains — and ONE thing more: CodeBuddy ships in two hosts whose
   * transcripts do NOT look alike. CodeBuddy Code (the CLI) writes the WorkBuddy JSONL, while the
   * IDE hands the Stop hook its own `<conversation>/index.json` directory layout. So the reader is
   * a dispatcher on the shape it was handed (core/transcript-codebuddy-ide.ts).
   */
  codebuddy: {
    configStyle: "nested",
    install: {
      sessionStart: { event: "SessionStart", entry: "codebuddy-sessionstart-hook.js", timeout: 30 },
      prompt: { event: "UserPromptSubmit", entry: "codebuddy-hook.js", timeout: 30 },
      stop: { event: "Stop", entry: "codebuddy-stop-hook.js", timeout: 60 }
    },
    sessionStart: genieSessionStart("codebuddy"),
    prompt: geniePrompt("codebuddy"),
    retain: genieRetain("codebuddy", readCodebuddyTranscript)
  }
};

// src/core/history.ts
import { execFileSync as execFileSync6 } from "child_process";
import {
  closeSync as closeSync2,
  existsSync as existsSync12,
  openSync as openSync2,
  readdirSync as readdirSync5,
  readFileSync as readFileSync14,
  readSync as readSync2,
  statSync as statSync4
} from "fs";
import { createHash as createHash5 } from "crypto";
import { homedir as homedir12 } from "os";
import { join as join23 } from "path";
import * as zlib2 from "zlib";

// src/core/transcript-dsh.ts
function textOf(message) {
  return (message.content || []).filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n").trim();
}
function stampOf4(event) {
  return typeof event.time === "number" ? { timestamp: new Date(event.time).toISOString() } : {};
}
function readDshEvents(events) {
  const turns = [];
  for (const event of events || []) {
    if (!event || typeof event !== "object") continue;
    const stamp = stampOf4(event);
    if (event.type === "user/message") {
      const message = event.data;
      if (!message || message.source?.kind !== "user") continue;
      const text = stripInjectedMemory(textOf(message)).trim();
      if (text) turns.push({ role: "user", content: text, ...stamp });
    } else if (event.type === "assistant/message") {
      const message = event.data?.message;
      if (!message) continue;
      const text = stripInjectedMemory(textOf(message)).trim();
      if (text) turns.push({ role: "assistant", content: text, ...stamp });
    } else if (event.type === "tool/call") {
      const call = event.data;
      if (!call?.name) continue;
      turns.push({
        role: "action",
        content: actionLine(call.name, parseArgs3(call.arguments)),
        ...stamp
      });
    }
  }
  return turns;
}
function parseArgs3(raw) {
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// src/core/transcript-pi.ts
function renderMessage(m) {
  if (!m || typeof m !== "object") return [];
  const role = m.role;
  if (role !== "user" && role !== "assistant") return [];
  const texts = [];
  const actions = [];
  if (typeof m.content === "string") {
    const t = stripInjectedMemory(m.content).trim();
    if (t) texts.push(t);
  } else if (Array.isArray(m.content)) {
    for (const part of m.content) {
      if (!part || typeof part !== "object") continue;
      const block = part;
      if (block.type === "text" && typeof block.text === "string") {
        const t = stripInjectedMemory(block.text).trim();
        if (t) texts.push(t);
      } else if (block.type === "toolCall" && typeof block.name === "string") {
        actions.push({ role: "action", content: actionLine(block.name, block.arguments) });
      }
    }
  }
  const out = [];
  const joined = texts.join("\n").trim();
  if (joined) out.push({ role, content: joined });
  out.push(...actions);
  return out;
}
function readPiTranscript(path) {
  const entries = [];
  for (const rawLine of readJsonl(path)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed === "object" && parsed !== null) entries.push(parsed);
  }
  return readPiEntries(entries);
}
function readPiEntries(entries) {
  const turns = [];
  for (const entry of entries) {
    if (!entry || entry.type !== "message" || !entry.message) continue;
    for (const turn of renderMessage(entry.message)) {
      turns.push(entry.timestamp ? { ...turn, timestamp: entry.timestamp } : turn);
    }
  }
  return turns;
}

// src/core/zstd-frames.ts
import * as zlib from "zlib";
var ZSTD_MAGIC = 4247762216;
function scanZstdFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (offset < buffer.length) {
    const start = offset;
    if (buffer.length - offset < 5) return frames;
    if (buffer.readUInt32LE(offset) !== ZSTD_MAGIC) return frames;
    offset += 4;
    const descriptor = buffer.readUInt8(offset);
    offset += 1;
    if ((descriptor & 24) !== 0) return frames;
    const contentSizeFlag = descriptor >>> 6;
    const singleSegment = (descriptor & 32) !== 0;
    const hasChecksum = (descriptor & 4) !== 0;
    const dictionaryFlag = descriptor & 3;
    const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag;
    const contentSizeBytes = contentSizeFlag === 0 ? singleSegment ? 1 : 0 : 1 << contentSizeFlag;
    offset += (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes;
    if (offset > buffer.length) return frames;
    for (; ; ) {
      if (buffer.length - offset < 3) return frames;
      const blockHeader = buffer.readUIntLE(offset, 3);
      offset += 3;
      const lastBlock = (blockHeader & 1) !== 0;
      const blockType = blockHeader >>> 1 & 3;
      if (blockType === 3) return frames;
      const payloadBytes = blockType === 1 ? 1 : blockHeader >>> 3;
      offset += payloadBytes;
      if (offset > buffer.length) return frames;
      if (lastBlock) break;
    }
    if (hasChecksum) {
      if (buffer.length - offset < 4) return frames;
      offset += 4;
    }
    frames.push({ start, end: offset });
  }
  return frames;
}
function zstdDecompressFrames(buffer) {
  return scanZstdFrames(buffer).map(
    (frame) => zlib.zstdDecompressSync(buffer.subarray(frame.start, frame.end)).toString("utf8")
  ).join("");
}

// src/core/history.ts
function claudeProjectDir(repoDir, home = homedir12()) {
  return join23(home, ".claude", "projects", repoDir.replace(/[^a-zA-Z0-9]/g, "-"));
}
function piSessionDir(repoDir) {
  return `--${repoDir.replace(/^[/\\]/, "").replace(/[/\\:]/g, "-")}--`;
}
function withinRepo(dir, repoDir) {
  return !!dir && (dir === repoDir || dir.startsWith(repoDir.endsWith("/") ? repoDir : repoDir + "/"));
}
function claudeSessionCwd(file) {
  try {
    for (const line of readFileSync14(file, "utf8").split("\n", 400)) {
      if (!line.includes('"cwd"')) continue;
      const cwd = JSON.parse(line).cwd;
      if (cwd) return cwd;
    }
  } catch {
  }
  return void 0;
}
function toSession(id, turns) {
  const prose = turns.filter((t) => t.role === "user" || t.role === "assistant").map((t) => ({
    role: t.role,
    text: t.content,
    ...t.timestamp ? { timestamp: t.timestamp } : {}
  }));
  return prose.length ? { id, turns: prose } : void 0;
}
function firstLine(path, cap = 1e6) {
  const fd = openSync2(path, "r");
  try {
    const chunk = Buffer.alloc(64 * 1024);
    let acc = "";
    while (acc.length < cap) {
      const n = readSync2(fd, chunk, 0, chunk.length, null);
      if (n <= 0) break;
      acc += chunk.subarray(0, n).toString("utf8");
      const nl = acc.indexOf("\n");
      if (nl !== -1) return acc.slice(0, nl);
    }
    return acc.length && acc.length < cap ? acc : void 0;
  } finally {
    closeSync2(fd);
  }
}
function listDir(dir) {
  try {
    return readdirSync5(dir);
  } catch {
    return [];
  }
}
function jsonlFiles(dir) {
  return listDir(dir).filter((f) => f.endsWith(".jsonl")).map((f) => join23(dir, f));
}
function claudeHistory(repoDir, home) {
  const root = join23(home, ".claude", "projects");
  const exact = claudeProjectDir(repoDir, home);
  const prefix = exact + "-";
  const dirs = listDir(root).map((d) => join23(root, d)).filter((d) => d === exact || d.startsWith(prefix));
  const sessions = [];
  let unattributed = 0;
  for (const file of dirs.flatMap(jsonlFiles)) {
    const cwd = claudeSessionCwd(file);
    if (!cwd) {
      unattributed++;
      continue;
    }
    if (!withinRepo(cwd, repoDir)) continue;
    try {
      const id = file.split("/").pop().replace(/\.jsonl$/, "");
      const s = toSession(id, readClaudeTranscript(file));
      if (s) sessions.push(s);
    } catch {
    }
  }
  return { supported: true, sessions, unattributed };
}
function codexHistory(repoDir, home) {
  const root = join23(home, ".codex", "sessions");
  if (!existsSync12(root)) return { supported: true, sessions: [] };
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync5(dir)) {
      const p = join23(dir, entry);
      if (statSync4(p).isDirectory()) walk(p);
      else if (entry.endsWith(".jsonl")) files.push(p);
    }
  };
  try {
    walk(root);
  } catch {
    return { supported: true, sessions: [] };
  }
  const sessions = [];
  for (const file of files) {
    try {
      const head = firstLine(file);
      if (!head) continue;
      const meta = JSON.parse(head);
      if (!withinRepo(meta?.payload?.cwd, repoDir)) continue;
      const s = toSession(meta.payload?.id ?? file, readCodexTranscript(file));
      if (s) sessions.push(s);
    } catch {
    }
  }
  return { supported: true, sessions };
}
var DCODE_THREADS_SCHEMA_VERSION = 1;
function dcodeTranscriptPath(root, threadId) {
  const digest = createHash5("sha256").update(threadId, "utf8").digest("hex");
  const suffix = `--${digest}.jsonl`;
  try {
    const match = readdirSync5(root).find((entry) => entry.endsWith(suffix));
    return match ? join23(root, match) : void 0;
  } catch {
    return void 0;
  }
}
function dcodeHistory(repoDir, home, runCli) {
  const root = join23(process.env.DEEPAGENTS_HOME || join23(home, ".deepagents"), "transcripts");
  if (!existsSync12(root)) return { supported: true, sessions: [] };
  let listed;
  try {
    listed = JSON.parse(runCli(["threads", "list", "--json"]));
  } catch {
    return {
      supported: false,
      reason: "dcode transcripts record no working directory, so `dcode threads list --json` is the only way to tell which sessions belong to this repo \u2014 and the dcode CLI is not runnable here",
      sessions: []
    };
  }
  const payload = listed;
  if (payload?.schema_version !== DCODE_THREADS_SCHEMA_VERSION || !Array.isArray(payload.data)) {
    return {
      supported: false,
      reason: `unrecognized \`dcode threads list --json\` schema (expected schema_version ${DCODE_THREADS_SCHEMA_VERSION})`,
      sessions: []
    };
  }
  const sessions = [];
  let unattributed = 0;
  for (const row of payload.data) {
    const threadId = typeof row?.thread_id === "string" ? row.thread_id : void 0;
    if (!threadId) continue;
    if (typeof row.cwd !== "string") {
      unattributed++;
      continue;
    }
    if (!withinRepo(row.cwd, repoDir)) continue;
    const file = dcodeTranscriptPath(root, threadId);
    if (!file) continue;
    try {
      const session = toSession(threadId, readDcodeTranscript(file));
      if (session) sessions.push(session);
    } catch {
    }
  }
  return { supported: true, sessions, ...unattributed ? { unattributed } : {} };
}
function dshHistory(repoDir, home) {
  const root = process.env.DSH_HOME ? join23(process.env.DSH_HOME, "sessions") : join23(home, ".dsh", "sessions");
  if (!existsSync12(root)) return { supported: true, sessions: [] };
  if (typeof zlib2.zstdDecompressSync !== "function") {
    return {
      supported: false,
      reason: `reading dsh session logs needs Node's built-in Zstandard support (Node 22.15+); this import is running on ${process.version}`,
      sessions: []
    };
  }
  const sessions = [];
  let unattributed = 0;
  for (const dir of readdirSync5(root).map((project) => join23(root, project))) {
    let sessionDirs;
    try {
      sessionDirs = readdirSync5(dir).map((id) => join23(dir, id));
    } catch {
      continue;
    }
    for (const sessionDir of sessionDirs) {
      const file = ["session.jsonl.zstd", "session.jsonl"].map((name) => join23(sessionDir, name)).find((candidate) => existsSync12(candidate));
      if (!file) continue;
      try {
        const lines = readDshLog(file);
        const header = JSON.parse(lines[0] ?? "{}");
        if (!header.cwd) {
          unattributed++;
          continue;
        }
        if (!withinRepo(header.cwd, repoDir)) continue;
        const events = lines.slice(1).flatMap((line) => {
          try {
            return [JSON.parse(line)];
          } catch {
            return [];
          }
        });
        const s = toSession(header.id ?? sessionDir, readDshEvents(events));
        if (s) sessions.push(s);
      } catch {
      }
    }
  }
  return { supported: true, sessions, unattributed };
}
function readDshLog(file) {
  const bytes = readFileSync14(file);
  const text = file.endsWith(".zstd") ? zstdDecompressFrames(bytes) : bytes.toString("utf8");
  return text.split("\n").filter((line) => line.trim());
}
function piFamilySessions(files, repoDir) {
  const sessions = [];
  let unattributed = 0;
  for (const file of files) {
    try {
      const head = firstLine(file);
      if (!head) continue;
      const meta = JSON.parse(head);
      if (meta?.type !== "session") continue;
      if (!meta.cwd) {
        unattributed++;
        continue;
      }
      if (!withinRepo(meta.cwd, repoDir)) continue;
      const s = toSession(meta.id ?? file, readPiTranscript(file));
      if (s) sessions.push(s);
    } catch {
    }
  }
  return { supported: true, sessions, unattributed };
}
function piHistory(repoDir, home) {
  const root = join23(home, ".pi", "agent", "sessions");
  if (!existsSync12(root)) return { supported: true, sessions: [] };
  const exact = piSessionDir(repoDir);
  const nested = `${exact.slice(0, -2)}-`;
  const files = [];
  for (const dir of listDir(root).filter((d) => d === exact || d.startsWith(nested))) {
    files.push(...jsonlFiles(join23(root, dir)));
  }
  return piFamilySessions(files, repoDir);
}
function primeAgentHistory(repoDir, home) {
  const root = join23(home, ".prime", "agent", "sessions");
  if (!existsSync12(root)) return { supported: true, sessions: [] };
  return piFamilySessions(jsonlFiles(root), repoDir);
}
var SQLITE_HISTORY = "keeps session history in an internal SQLite database, whose schema is unversioned and would break on any upstream change";
function importLocalHistory(harness, repoDir, home = homedir12(), runDcodeCli) {
  switch (harness) {
    case "claude-code":
      return claudeHistory(repoDir, home);
    case "codex":
      return codexHistory(repoDir, home);
    case "dcode":
      return dcodeHistory(
        repoDir,
        home,
        runDcodeCli ?? ((args) => execFileSync6("dcode", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }))
      );
    case "dsh":
      return dshHistory(repoDir, home);
    case "pi":
      return piHistory(repoDir, home);
    case "prime-agent":
      return primeAgentHistory(repoDir, home);
    case "opencode":
    // opencode v2 keeps sessions in the SAME `opencode.db` v1 does.
    case "opencode2":
    case "kilo":
    case "cursor-cli":
    case "cline-cli":
    case "copilot-cli":
    case "devin-cli":
      return { supported: false, reason: `${harness} ${SQLITE_HISTORY}`, sessions: [] };
    // TraeCode has no reader for the same reason as ZCode below: no session files on disk at all
    // (sessions live in an encrypted local DB / the cloud), which is why the plugin journals live
    // sessions itself (core/turn-journal.ts) — and why there is no past history to backfill from.
    case "traecode":
    case "zcode":
      return {
        supported: false,
        reason: `${harness} keeps no session transcripts on disk to import`,
        sessions: []
      };
    default:
      return { supported: false, reason: `no local history reader for ${harness}`, sessions: [] };
  }
}

// src/install-ui.ts
import { execFileSync as execFileSync7 } from "child_process";
import { readSync as readSync3 } from "fs";
function fitSelectRow(label, hint, width) {
  const room = Math.max(10, width - 6);
  let hintText = hint ? ` \u2014 ${hint}` : "";
  if (label.length > room) return { label: `${label.slice(0, room - 1)}\u2026`, hint: "" };
  if (label.length + hintText.length > room) {
    hintText = `${hintText.slice(0, room - label.length - 1)}\u2026`;
  }
  return { label, hint: hintText };
}
function splitKeys(chunk) {
  const keys = [];
  for (let i = 0; i < chunk.length; ) {
    if (chunk[i] === "\x1B" && chunk[i + 1] === "[") {
      let j = i + 2;
      while (j < chunk.length && !(chunk[j] >= "@" && chunk[j] <= "~")) j++;
      keys.push(chunk.slice(i, Math.min(j + 1, chunk.length)));
      i = j + 1;
    } else {
      keys.push(chunk[i]);
      i += 1;
    }
  }
  return keys;
}
function selectKeyAction(key, index, count) {
  if (key === "\x1B[A" || key === "k") return { kind: "move", index: (index + count - 1) % count };
  if (key === "\x1B[B" || key === "j") return { kind: "move", index: (index + 1) % count };
  if (key === "\r" || key === "\n") return { kind: "submit", index };
  if (key === "" || key === "\x1B" || key === "q") return { kind: "cancel", index };
  const digit = Number.parseInt(key, 10);
  if (digit >= 1 && digit <= count) return { kind: "submit", index: digit - 1 };
  return { kind: "none", index };
}
var WARN_RE = /\bskipped\b|could not|manually|preserved|did not finish|unrecognised|add `hooks = true`/i;
var ERROR_RE = /unknown harness|no supported coding agents|name a harness/;
var INFO_RE = /^usage:|^detected: |\?$/;
var EMOJI_KIND = {
  "\u2705": "ok",
  "\u26A0\uFE0F": "warn",
  "\u274C": "error"
};
function createInstallerUi(o) {
  const sink = o.write ?? ((line) => console.log(line));
  let lastLine = "";
  const write2 = (line) => {
    lastLine = line;
    sink(line);
  };
  const colors = o.colors ?? (process.stdout.isTTY === true && process.env.NO_COLOR === void 0 && process.env.TERM !== "dumb");
  const now = o.now ?? Date.now;
  const paint = (code, s) => colors ? `\x1B[${code}m${s}\x1B[0m` : s;
  const dim = (s) => paint("2", s);
  const bold = (s) => paint("1", s);
  const green = (s) => paint("32", s);
  const yellow = (s) => paint("33", s);
  const red = (s) => paint("31", s);
  const cyan = (s) => paint("36", s);
  const bar = dim("\u2502");
  const symbol = { ok: green("\u2713"), warn: yellow("\u25B2"), error: red("\u2716"), info: dim("\u25CB") };
  const tidy = (s) => s.replaceAll(o.home, "~");
  const dimPaths = (s) => s.replace(/(?<![:\w/])~?\/[^\s"',)]+/g, (m) => dim(m));
  const prefixRe = new RegExp(`^(${[...o.harnessNames, ...o.auxNames ?? []].join("|")}): `);
  const startedAt = now();
  let group = null;
  let groups = 0;
  function classify(line) {
    if (INFO_RE.test(line)) return "info";
    if (ERROR_RE.test(line)) return "error";
    if (WARN_RE.test(line)) return "warn";
    return "ok";
  }
  const spacer = () => {
    if (lastLine !== bar) write2(bar);
  };
  function openGroup(name) {
    spacer();
    write2(`${cyan("\u25C7")}  ${bold(name)}`);
    group = name;
    if (o.harnessNames.includes(name)) groups++;
  }
  return {
    intro() {
      write2("");
      write2(
        `${dim("\u250C")}  ${colors ? brandWord() : "Hindsight"} ${bold("coding agents")}` + (o.version ? `  ${dim(`v${o.version}`)}` : "")
      );
      write2(bar);
    },
    /** Style an interactive question so readline prompts sit on the rail like log lines. */
    prompt(question) {
      return `${bar}  ${question}`;
    },
    select(question, options, defaultIndex) {
      const stty = (args) => execFileSync7("stty", args, { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" }).trim();
      let savedTty;
      try {
        savedTty = stty(["-g"]);
        stty(["raw", "-echo"]);
      } catch {
        return void 0;
      }
      const render = (index2, redraw) => {
        const width = process.stdout.columns || 80;
        const rows = options.map((opt, i) => {
          const on = i === index2;
          const pointer = on ? cyan("\u276F") : " ";
          const fitted = fitSelectRow(opt.label, opt.hint, width);
          const label = on ? bold(fitted.label) : fitted.label;
          return `\x1B[2K${bar}  ${pointer} ${label}${fitted.hint ? dim(fitted.hint) : ""}`;
        });
        if (redraw) process.stdout.write(`\x1B[${options.length}A`);
        process.stdout.write(rows.map((r) => `\r${r}\r
`).join(""));
      };
      lastLine = "select";
      process.stdout.write("\x1B[?7l");
      process.stdout.write(`${bar}  ${symbol.info} ${dim(question)} ${dim("(\u2191/\u2193, Enter)")}\r
`);
      let index = Math.min(Math.max(defaultIndex, 0), options.length - 1);
      render(index, false);
      const buf = Buffer.alloc(16);
      try {
        for (; ; ) {
          let n;
          try {
            n = readSync3(0, buf, 0, buf.length, null);
          } catch (e) {
            if (e.code !== "EAGAIN") return null;
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
            continue;
          }
          if (n === 0) return null;
          for (const key of splitKeys(buf.subarray(0, n).toString("latin1"))) {
            const action = selectKeyAction(key, index, options.length);
            index = action.index;
            if (action.kind === "move") render(index, true);
            else if (action.kind === "submit") {
              render(index, true);
              return index;
            } else if (action.kind === "cancel") return null;
          }
        }
      } finally {
        process.stdout.write("\x1B[?7h");
        try {
          stty([savedTty]);
        } catch {
        }
      }
    },
    log(message) {
      const text = tidy(message).replace(/^\n+|\n+$/g, "");
      if (!text) return;
      const lines = text.split("\n");
      if (/^\s/.test(lines[0])) {
        for (const l of lines) write2(`${bar}    ${dim(l.trim())}`);
        return;
      }
      const emoji = lines[0].match(/^(✅|❌|⚠️)\s*/u);
      if (emoji) lines[0] = lines[0].slice(emoji[0].length);
      const prefixed = lines[0].match(prefixRe);
      if (prefixed) {
        if (prefixed[1] !== group) openGroup(prefixed[1]);
        lines[0] = lines[0].slice(prefixed[0].length);
      }
      const kind = emoji ? EMOJI_KIND[emoji[1]] : classify(lines[0]);
      write2(`${bar}  ${symbol[kind]} ${kind === "info" ? dim(lines[0]) : dimPaths(lines[0])}`);
      for (const rest of lines.slice(1)) write2(`${bar}    ${dim(rest.trim())}`);
    },
    outro(exitCode) {
      spacer();
      if (exitCode !== 0) {
        write2(
          `${dim("\u2514")}  ${red("\u2716")} ${groups ? "Completed with errors \u2014 see above." : "Aborted \u2014 nothing was changed."}`
        );
      } else if (o.command === "install" || o.command === "uninstall") {
        const secs = ((now() - startedAt) / 1e3).toFixed(1);
        const agents = `${groups} agent${groups === 1 ? "" : "s"}`;
        if (o.command === "install") {
          const settings = o.configPath ? tidy(o.configPath) : "~/.hindsight/coding-agent.json";
          write2(`${dim("\u2514")}  ${green("\u2713")} Installed ${agents} in ${secs}s`);
          write2(`   ${dim(`Start a session \u2014 settings live in ${settings}.`)}`);
        } else {
          write2(
            `${dim("\u2514")}  ${green("\u2713")} Uninstalled ${agents} in ${secs}s \u2014 Hindsight entries removed, *.hindsight-backup files left in place.`
          );
        }
      } else if (o.command === "update") {
        write2(
          `${dim("\u2514")}  ${green("\u2713")} Runtime up to date${o.version ? ` (v${o.version})` : ""}`
        );
      } else {
        write2(dim("\u2514"));
      }
      write2("");
    }
  };
}

// src/installer.ts
var MARKER = "coding-agents";
var ZCODE_MAX_OUTPUT_BYTES = 32768;
var zcodeConfigPath = (c) => join24(c.home, ".zcode", "cli", "config.json");
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function readJson2(path) {
  try {
    const parsed = JSON.parse(readFileSync15(path, "utf8"));
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function parseJsonc(text) {
  const stripped = text.replace(/"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => m[0] === '"' ? m : "").replace(/,(\s*[}\]])/g, "$1");
  try {
    const v = JSON.parse(stripped);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}
function writeJson(path, value) {
  mkdirSync7(dirname13(path), { recursive: true });
  backupOnce(path);
  writeFileSync5(path, JSON.stringify(value, null, 2) + "\n");
}
function backupOnce(path) {
  if (existsSync13(path) && !existsSync13(`${path}.hindsight-backup`)) {
    copyFileSync(path, `${path}.hindsight-backup`);
  }
}
function writeJsonc(path, key, value) {
  const text = existsSync13(path) ? readFileSync15(path, "utf8") : "";
  const edits = modify(text, [key], value, {
    formattingOptions: {
      tabSize: 2,
      insertSpaces: true,
      // Keep a CRLF file CRLF: rewriting every line ending would turn a one-line change into a
      // whole-file diff for anyone on Windows.
      eol: text.includes("\r\n") ? "\r\n" : "\n"
    }
  });
  const next = applyEdits(text, edits);
  mkdirSync7(dirname13(path), { recursive: true });
  backupOnce(path);
  writeFileSync5(path, next.endsWith("\n") ? next : `${next}
`);
}
function mergeHookEvent(existing, entry) {
  const kept = (existing ?? []).filter((e) => !JSON.stringify(e).includes(MARKER));
  return [...kept, entry];
}
function stripOurs(existing) {
  return (existing ?? []).filter((e) => !JSON.stringify(e).includes(MARKER));
}
function setOrDelete(obj, key, arr) {
  if (arr.length) obj[key] = arr;
  else delete obj[key];
}
var cmdHook = (dist, file, timeout) => ({
  hooks: [{ type: "command", command: `node "${join24(dist, file)}"`, timeout }]
});
var processHook = (dist, file, timeoutMs) => ({
  hooks: [{ type: "process", command: "node", args: [join24(dist, file)], timeoutMs }]
});
var mcpServerEntry = (dist, harness, extraArgs = []) => ({
  command: "node",
  args: [join24(dist, "mcp-server.js"), ...extraArgs],
  env: { HINDSIGHT_MCP_HARNESS: harness }
});
function mergeHarnessHooks(hooks, harness, dist) {
  const spec = HOOK_HARNESSES[harness];
  if (spec.configStyle === "toml-array")
    throw new Error(`${harness} writes its own TOML hook block; mergeHarnessHooks cannot emit it`);
  const installedEvents = /* @__PURE__ */ new Set();
  for (const hook of [...Object.values(spec.install), ...spec.additionalHooks ?? []]) {
    if (installedEvents.has(hook.event)) continue;
    installedEvents.add(hook.event);
    const entry = spec.configStyle === "nested" ? cmdHook(dist, hook.entry, hook.timeout) : spec.configStyle === "process" ? processHook(dist, hook.entry, hook.timeout) : {
      command: `node "${join24(dist, hook.entry)}"`,
      ...hook.timeout ? { timeout: hook.timeout } : {}
    };
    hooks[hook.event] = mergeHookEvent(hooks[hook.event], entry);
  }
}
function stripHarnessHooks(hooks, harness) {
  const strippedEvents = /* @__PURE__ */ new Set();
  const spec = HOOK_HARNESSES[harness];
  for (const hook of [...Object.values(spec.install), ...spec.additionalHooks ?? []]) {
    if (strippedEvents.has(hook.event)) continue;
    strippedEvents.add(hook.event);
    setOrDelete(hooks, hook.event, stripOurs(hooks[hook.event]));
  }
}
function skillsBaseFor(c, harness) {
  const parts = resolveSkillDirs(harness, c.home);
  if (!parts) throw new Error(`${harness} installs a skill but names no directory in SKILL_DIRS`);
  return join24(c.home, ...parts);
}
function installSkill(c, harness) {
  const src = join24(c.pkgRoot, "skill");
  if (!existsSync13(join24(src, "SKILL.md"))) return;
  const skillsBase = skillsBaseFor(c, harness);
  const dst = join24(skillsBase, "hindsight-coding-agent");
  mkdirSync7(skillsBase, { recursive: true });
  cpSync2(src, dst, { recursive: true });
  c.log?.(`${harness}: skill installed at ${dst}`);
}
function uninstallSkill(c, harness) {
  rmSync4(join24(skillsBaseFor(c, harness), "hindsight-coding-agent"), {
    recursive: true,
    force: true
  });
}
function onPath2(bin) {
  try {
    execFileSync8("which", [bin], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function runClinePlugin(args) {
  try {
    execFileSync8("cline", args, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
var OPENCODE_CONFIG_CANDIDATES = ["opencode.jsonc", "opencode.json"];
function opencodeConfigPath(c) {
  const dir = join24(c.home, ".config", "opencode");
  const existing = OPENCODE_CONFIG_CANDIDATES.map((f) => join24(dir, f)).find((p) => existsSync13(p));
  return existing ?? join24(dir, "opencode.json");
}
function runDcodePlugin(args) {
  try {
    execFileSync8("dcode", args, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
function registerOpencodePlugin(c, name) {
  const path = opencodeConfigPath(c);
  let cfg = {};
  if (existsSync13(path)) {
    const parsed = parseJsonc(readFileSync15(path, "utf8"));
    if (!parsed) {
      c.log?.(`${name}: SKIPPED \u2014 could not parse ${path}; add the plugin entry manually`);
      return;
    }
    cfg = parsed;
  }
  const plugins = Array.isArray(cfg.plugin) ? cfg.plugin : [];
  writeJsonc(path, "plugin", [...plugins.filter((p) => !String(p).includes(MARKER)), c.pkgRoot]);
  c.log?.(`${name}: plugin registered in ${path}`);
}
function unregisterOpencodePlugin(c, name) {
  const path = opencodeConfigPath(c);
  if (!existsSync13(path)) return;
  const cfg = parseJsonc(readFileSync15(path, "utf8"));
  if (!cfg || !Array.isArray(cfg.plugin)) return;
  const kept = cfg.plugin.filter((p) => !String(p).includes(MARKER));
  writeJsonc(path, "plugin", kept.length ? kept : void 0);
  c.log?.(`${name}: plugin entry removed`);
}
var opencode = {
  name: "opencode",
  detect: (c) => onPath2("opencode") || existsSync13(join24(c.home, ".config", "opencode")),
  install: (c) => registerOpencodePlugin(c, "opencode"),
  uninstall: (c) => unregisterOpencodePlugin(c, "opencode")
};
var opencode2 = {
  name: "opencode2",
  detect: () => onPath2("opencode2"),
  install: (c) => registerOpencodePlugin(c, "opencode2"),
  uninstall: (c) => unregisterOpencodePlugin(c, "opencode2")
};
function piFamilyInstaller(harness, configDir) {
  const settings = (c) => join24(c.home, ...configDir, "settings.json");
  return {
    name: harness,
    // Both hosts name their executable exactly as we name the harness, so the harness id doubles
    // as the PATH probe here — unlike, say, antigravity-cli, whose binary is `agy`.
    detect: (c) => onPath2(harness) || existsSync13(join24(c.home, ...configDir)),
    install(c) {
      const path = settings(c);
      const cfg = readJson2(path);
      const entry = join24(c.pkgRoot, "dist", `${harness}.js`);
      const exts = Array.isArray(cfg.extensions) ? cfg.extensions : [];
      cfg.extensions = [...exts.filter((p) => !String(p).includes(MARKER)), entry];
      writeJson(path, cfg);
      installSkill(c, harness);
      c.log?.(`${harness}: extension registered in ${path}`);
    },
    uninstall(c) {
      uninstallSkill(c, harness);
      const path = settings(c);
      if (!existsSync13(path)) return;
      const cfg = readJson2(path);
      if (Array.isArray(cfg.extensions)) {
        cfg.extensions = cfg.extensions.filter((p) => !String(p).includes(MARKER));
        if (!cfg.extensions.length) delete cfg.extensions;
        writeJson(path, cfg);
      }
      c.log?.(`${harness}: extension entry + skill removed`);
    }
  };
}
var pi = piFamilyInstaller("pi", [".pi", "agent"]);
var primeAgent = piFamilyInstaller("prime-agent", [".prime", "agent"]);
var KILO_CONFIG_CANDIDATES = ["kilo.jsonc", "kilo.json", "opencode.json"];
function kiloConfigPath(c) {
  const dir = join24(c.home, ".config", "kilo");
  const existing = KILO_CONFIG_CANDIDATES.map((f) => join24(dir, f)).find((p) => existsSync13(p));
  return existing ?? join24(dir, "kilo.json");
}
var kilo = {
  name: "kilo",
  detect: (c) => onPath2("kilo") || existsSync13(join24(c.home, ".config", "kilo")),
  install(c) {
    const path = kiloConfigPath(c);
    let cfg = {};
    if (existsSync13(path)) {
      const parsed = parseJsonc(readFileSync15(path, "utf8"));
      if (!parsed) {
        c.log?.(`kilo: SKIPPED \u2014 could not parse ${path}; add the plugin entry manually`);
        return;
      }
      cfg = parsed;
    }
    const entry = pathToFileURL(join24(c.dist, "kilo.js")).href;
    const plugins = Array.isArray(cfg.plugin) ? cfg.plugin : [];
    writeJsonc(path, "plugin", [...plugins.filter((p) => !String(p).includes(MARKER)), entry]);
    c.log?.(`kilo: plugin registered in ${path}`);
  },
  uninstall(c) {
    const path = kiloConfigPath(c);
    if (!existsSync13(path)) return;
    const cfg = parseJsonc(readFileSync15(path, "utf8"));
    if (!cfg || !Array.isArray(cfg.plugin)) return;
    const kept = cfg.plugin.filter((p) => !String(p).includes(MARKER));
    writeJsonc(path, "plugin", kept.length ? kept : void 0);
    c.log?.("kilo: plugin entry removed");
  }
};
var claudeCode = {
  name: "claude-code",
  detect: (c) => onPath2("claude") || existsSync13(join24(c.home, ".claude")),
  install(c) {
    const path = join24(c.home, ".claude", "settings.json");
    const settings = readJson2(path);
    settings.hooks = settings.hooks ?? {};
    mergeHarnessHooks(settings.hooks, "claude-code", c.dist);
    writeJson(path, settings);
    c.log?.(`claude-code: hooks merged into ${path}`);
    installSkill(c, "claude-code");
    const mcp = c.claudeMcp ?? defaultClaudeMcp;
    mcp(["mcp", "remove", "--scope", "user", "hindsight"]);
    if (mcp([
      "mcp",
      "add",
      "--scope",
      "user",
      "hindsight",
      "--env",
      "HINDSIGHT_MCP_HARNESS=claude-code",
      "--",
      "node",
      join24(c.dist, "mcp-server.js")
    ])) {
      c.log?.("claude-code: MCP server registered (claude mcp add, user scope)");
    } else {
      c.log?.(
        `claude-code: could not run \`claude mcp add\` \u2014 register the tools manually:
  claude mcp add --scope user hindsight --env HINDSIGHT_MCP_HARNESS=claude-code -- node "${join24(c.dist, "mcp-server.js")}"`
      );
    }
  },
  uninstall(c) {
    const path = join24(c.home, ".claude", "settings.json");
    if (existsSync13(path)) {
      const settings = readJson2(path);
      if (settings.hooks) {
        stripHarnessHooks(settings.hooks, "claude-code");
        if (!Object.keys(settings.hooks).length) delete settings.hooks;
        writeJson(path, settings);
      }
    }
    const mcp = c.claudeMcp ?? defaultClaudeMcp;
    mcp(["mcp", "remove", "--scope", "user", "hindsight"]);
    uninstallSkill(c, "claude-code");
    c.log?.("claude-code: hooks + MCP registration + skill removed");
  }
};
function defaultClaudeMcp(args) {
  try {
    execFileSync8("claude", args, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
var CODEX_MCP_BLOCK_RE = /^\[mcp_servers\.hindsight(?:\.[^\]]+)?\][^\n]*\n(?:(?!\[)[^\n]*\n?)*/gm;
var codexMcpBlock = (dist) => `[mcp_servers.hindsight]
command = "node"
args = [${JSON.stringify(join24(dist, "mcp-server.js"))}]
env = { HINDSIGHT_MCP_HARNESS = "codex" }`;
var codex = {
  name: "codex",
  detect: (c) => onPath2("codex") || existsSync13(join24(c.home, ".codex")),
  install(c) {
    const hooksPath = join24(c.home, ".codex", "hooks.json");
    const cfg = readJson2(hooksPath);
    cfg.hooks = cfg.hooks ?? {};
    mergeHarnessHooks(cfg.hooks, "codex", c.dist);
    writeJson(hooksPath, cfg);
    c.log?.(`codex: hooks merged into ${hooksPath}`);
    const tomlPath = join24(c.home, ".codex", "config.toml");
    const existing = existsSync13(tomlPath) ? readFileSync15(tomlPath, "utf8") : "";
    const toml = existing.replace(CODEX_MCP_BLOCK_RE, "");
    const additions = [];
    if (!/^\s*(codex_hooks|hooks)\s*=/m.test(toml)) {
      if (/^\[features\]/m.test(toml)) {
        c.log?.(
          "codex: add `hooks = true` under your existing [features] section in ~/.codex/config.toml"
        );
      } else {
        additions.push("[features]\nhooks = true");
      }
    }
    additions.push(codexMcpBlock(c.dist));
    const next = `${toml.replace(/\n*$/, "\n\n")}${additions.join("\n\n")}
`;
    if (next !== existing) {
      if (existsSync13(tomlPath) && !existsSync13(`${tomlPath}.hindsight-backup`)) {
        copyFileSync(tomlPath, `${tomlPath}.hindsight-backup`);
      }
      mkdirSync7(dirname13(tomlPath), { recursive: true });
      writeFileSync5(tomlPath, next);
      c.log?.(`codex: wrote ${additions.length} section(s) to ${tomlPath}`);
    }
    installSkill(c, "codex");
  },
  uninstall(c) {
    const hooksPath = join24(c.home, ".codex", "hooks.json");
    if (existsSync13(hooksPath)) {
      const cfg = readJson2(hooksPath);
      if (cfg.hooks) {
        stripHarnessHooks(cfg.hooks, "codex");
        writeJson(hooksPath, cfg);
      }
    }
    uninstallSkill(c, "codex");
    const tomlPath = join24(c.home, ".codex", "config.toml");
    if (existsSync13(tomlPath)) {
      const toml = readFileSync15(tomlPath, "utf8");
      const cleaned = toml.replace(CODEX_MCP_BLOCK_RE, "");
      if (cleaned !== toml) writeFileSync5(tomlPath, cleaned);
    }
    c.log?.(
      "codex: hooks + MCP section + skill removed ([features] hooks flag left as-is \u2014 other hooks may use it)"
    );
  }
};
var antigravity = {
  name: "antigravity-cli",
  // `agy` is the supported Antigravity CLI executable.  Do not infer support from the
  // legacy Gemini CLI's ~/.gemini state: both clients may leave files there, but only agy
  // can consume this integration.
  detect: (c) => onPath2("agy"),
  install(c) {
    const hooksPath = join24(c.home, ".gemini", "config", "hooks.json");
    const hooks = readJson2(hooksPath);
    for (const key of Object.keys(hooks)) {
      if (key !== MARKER && key.includes(MARKER)) delete hooks[key];
    }
    hooks[MARKER] = hooks[MARKER] ?? {};
    mergeHarnessHooks(hooks[MARKER], "antigravity-cli", c.dist);
    for (const event of ["PreInvocation", "Stop"]) {
      setOrDelete(hooks, event, stripOurs(hooks[event]));
    }
    writeJson(hooksPath, hooks);
    const mcpPath = join24(c.home, ".gemini", "config", "mcp_config.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = {
      ...mcp.mcpServers ?? {},
      hindsight: mcpServerEntry(c.dist, "antigravity-cli")
    };
    writeJson(mcpPath, mcp);
    const settingsPath = join24(c.home, ".gemini", "antigravity-cli", "settings.json");
    const settings = readJson2(settingsPath);
    if (!settings.statusLine) {
      settings.statusLine = {
        type: "command",
        command: `node "${join24(c.dist, "antigravity-statusline.js")}"`
      };
      writeJson(settingsPath, settings);
      c.log?.(`antigravity-cli: Hindsight status line enabled in ${settingsPath}`);
    } else if (JSON.stringify(settings.statusLine).includes(MARKER)) {
      settings.statusLine = {
        type: "command",
        command: `node "${join24(c.dist, "antigravity-statusline.js")}"`
      };
      writeJson(settingsPath, settings);
    } else {
      c.log?.(
        "antigravity-cli: existing custom status line preserved (Hindsight indicator not added)"
      );
    }
    c.log?.(`antigravity-cli: hooks merged into ${hooksPath}, MCP into ${mcpPath}`);
    installSkill(c, "antigravity-cli");
  },
  uninstall(c) {
    const hooksPath = join24(c.home, ".gemini", "config", "hooks.json");
    if (existsSync13(hooksPath)) {
      const hooks = readJson2(hooksPath);
      if (hooks[MARKER]) {
        stripHarnessHooks(hooks[MARKER], "antigravity-cli");
        if (!Object.keys(hooks[MARKER]).length) delete hooks[MARKER];
      }
      for (const event of ["PreInvocation", "Stop"]) {
        setOrDelete(hooks, event, stripOurs(hooks[event]));
      }
      writeJson(hooksPath, hooks);
    }
    const mcpPath = join24(c.home, ".gemini", "config", "mcp_config.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    const settingsPath = join24(c.home, ".gemini", "antigravity-cli", "settings.json");
    if (existsSync13(settingsPath)) {
      const settings = readJson2(settingsPath);
      if (JSON.stringify(settings.statusLine ?? {}).includes(MARKER)) {
        delete settings.statusLine;
        writeJson(settingsPath, settings);
      }
    }
    uninstallSkill(c, "antigravity-cli");
    c.log?.("antigravity-cli: hooks + MCP entry + status line + skill removed");
  }
};
function pathNodeHasSqlite() {
  try {
    execFileSync8("node", ["-e", "require('node:sqlite')"], { stdio: "pipe", timeout: 1e4 });
    return true;
  } catch {
    return false;
  }
}
function pathNodeVersion() {
  try {
    return execFileSync8("node", ["-v"], { encoding: "utf8", stdio: "pipe" }).trim();
  } catch {
    return "not found";
  }
}
function runtimeDir(home) {
  return join24(home, ".hindsight", "coding-agents");
}
var ORIGIN_FILE = ".install-origin.json";
function stageRuntime(c) {
  const target = runtimeDir(c.home);
  const same = (a, b) => {
    try {
      return realpathSync3(a) === realpathSync3(b);
    } catch {
      return a === b;
    }
  };
  if (same(c.pkgRoot, target)) return c;
  if (!existsSync13(join24(c.dist, "installer.js"))) return c;
  try {
    rmSync4(join24(target, "dist"), { recursive: true, force: true });
    mkdirSync7(target, { recursive: true });
    cpSync2(c.dist, join24(target, "dist"), { recursive: true });
    const skill = join24(c.pkgRoot, "skill");
    if (existsSync13(skill)) cpSync2(skill, join24(target, "skill"), { recursive: true });
    const pkgJson = join24(c.pkgRoot, "package.json");
    if (existsSync13(pkgJson)) copyFileSync(pkgJson, join24(target, "package.json"));
    for (const resource of ["plugin.json", "hooks", "index.js"]) {
      const source = join24(c.pkgRoot, resource);
      if (existsSync13(source)) cpSync2(source, join24(target, resource), { recursive: true });
    }
    writeFileSync5(
      join24(target, ORIGIN_FILE),
      JSON.stringify({ source: c.pkgRoot, stagedAt: (/* @__PURE__ */ new Date()).toISOString() })
    );
    c.log?.(`runtime staged at ${target}`);
    return { ...c, pkgRoot: target, dist: join24(target, "dist") };
  } catch (error) {
    c.log?.(`could not stage the runtime at ${target}: ${String(error)}`);
    return c;
  }
}
var SERVER_MODES = ["cloud", "self-hosted", "daemon"];
function flagValue(args, name) {
  const inline = args.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : void 0;
}
function flagValueArgs(args, names) {
  const taken = /* @__PURE__ */ new Set();
  for (const name of names) {
    const i = args.indexOf(`--${name}`);
    if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) taken.add(args[i + 1]);
  }
  return taken;
}
var CONFIG_RELATIVE = [".hindsight", "coding-agent.json"];
var hindsightConfigPath = (c) => process.env.HINDSIGHT_CONFIG || join24(c.home, ...CONFIG_RELATIVE);
var SERVER_CHOICES = [
  { mode: "cloud", label: "Hindsight Cloud", hint: "hosted, needs an API token" },
  { mode: "self-hosted", label: "Self-hosted server", hint: "a Hindsight server you already run" },
  {
    mode: "daemon",
    label: "Local daemon (on-device)",
    hint: "runs hindsight-embed here; no account, needs uv + an LLM key"
  }
];
function promptServerMode(c) {
  if (c.selectPrompt) {
    const picked = c.selectPrompt(
      "Where should memory live?",
      SERVER_CHOICES.map(({ label, hint }) => ({ label, hint })),
      0
    );
    if (picked === null) {
      c.log?.("no server chosen \u2014 leaving the server config unchanged");
      return void 0;
    }
    if (picked !== void 0) return SERVER_CHOICES[picked].mode;
  }
  c.log?.(
    `
Where should memory live?
` + SERVER_CHOICES.map((o, i) => `  ${i + 1}) ${o.label.padEnd(28)}\u2014 ${o.hint}`).join("\n") + `
`
  );
  const answer = readLineSync(c, "Choose [1-3] (default 1): ").trim();
  if (answer === "") return "cloud";
  const digit = Number.parseInt(answer, 10);
  if (digit >= 1 && digit <= SERVER_CHOICES.length) return SERVER_CHOICES[digit - 1].mode;
  c.log?.(`unrecognised choice "${answer}" \u2014 leaving the server config unchanged`);
  return void 0;
}
function readLineSync(c, prompt) {
  process.stdout.write((c.promptStyle ?? ((s) => s))(prompt));
  const buf = Buffer.alloc(1024);
  for (; ; ) {
    try {
      const n = readSync4(0, buf, 0, buf.length, null);
      return buf.subarray(0, n).toString("utf8");
    } catch (e) {
      if (e.code !== "EAGAIN") {
        return "";
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
}
function configureServer(c, args, installing) {
  const explicit = flagValue(args, "server");
  if (explicit && !SERVER_MODES.includes(explicit)) {
    c.log?.(`unknown --server "${explicit}" \u2014 expected one of: ${SERVER_MODES.join(", ")}`);
    return false;
  }
  const configPath = hindsightConfigPath(c);
  const existing = readJson2(configPath);
  const alreadyConfigured = !!(existing.serverMode || existing.apiUrl);
  let mode = explicit;
  if (!mode) {
    if (alreadyConfigured) return true;
    const legacy = (c.readLegacy ?? readLegacyEndpoint)(c.home, installing);
    if (legacy) {
      const carried = { ...existing, serverMode: legacy.serverMode };
      if (legacy.apiUrl) carried.apiUrl = legacy.apiUrl;
      if (legacy.apiToken) carried.apiToken = legacy.apiToken;
      if (legacy.apiPort) carried.apiPort = legacy.apiPort;
      writeJson(configPath, carried);
      c.log?.(
        `server: ${legacy.serverMode}${legacy.apiUrl ? ` (${legacy.apiUrl})` : ""} \u2014 carried over from the ${legacy.harness} plugin (${legacy.source})
        Only the endpoint moves; conversations do not. To bring this repo's history
        across, re-run here with --import-conversations.`
      );
      if (legacy.serverMode === "daemon") reportDaemonPrereqs(c);
      return true;
    }
    if (!c.interactive) {
      c.log?.(
        `
server: defaulting to Hindsight Cloud. Re-run with --server self-hosted|daemon to change,
        or edit ${configPath}.`
      );
      return true;
    }
    mode = promptServerMode(c);
    if (!mode) return true;
  }
  const next = { ...existing, serverMode: mode };
  if (mode === "cloud") {
    delete next.apiUrl;
    const token = flagValue(args, "api-token") ?? (c.interactive ? askToken(c) : void 0);
    if (!token) {
      c.log?.(
        `\u274C Hindsight Cloud needs an API token \u2014 pass --api-token <token> (or set apiToken in ${configPath}).`
      );
      return false;
    }
    next.apiToken = token;
  } else if (mode === "self-hosted") {
    const url = flagValue(args, "api-url") ?? (c.interactive ? readLineSync(c, "Server URL (e.g. http://localhost:8888): ").trim() : void 0);
    if (!url) {
      c.log?.(
        `\u274C self-hosted mode needs a server URL \u2014 pass --api-url <url> (or set apiUrl in ${configPath}).`
      );
      return false;
    }
    next.apiUrl = url;
    const token = flagValue(args, "api-token");
    if (token) next.apiToken = token;
  } else {
    delete next.apiUrl;
    reportDaemonPrereqs(c);
  }
  writeJson(configPath, next);
  c.log?.(`server: ${mode} (${configPath})`);
  return true;
}
function askToken(c) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = readLineSync(c, "API token (required for Hindsight Cloud): ").trim();
    if (token) return token;
    c.log?.("  a token is required \u2014 find yours in the Hindsight Cloud dashboard");
  }
  return void 0;
}
function reportDaemonPrereqs(c) {
  if (!(c.hasUvx ?? hasUvx)()) {
    c.log?.(
      `\u26A0\uFE0F  \`uv\` is not on PATH. The daemon is fetched and run with it, so memory stays inert
    until you install it: https://docs.astral.sh/uv/`
    );
  }
  if (!(c.hasRust ?? hasRustToolchain)()) {
    c.log?.(
      `\u26A0\uFE0F  macOS needs a current Rust toolchain to build the daemon's dependencies (litellm
    publishes no macOS wheel). Install from https://rustup.rs, then
    \`rustup default stable && rustup update\` \u2014 an OUT-OF-DATE toolchain fails too.`
    );
  }
  const llm = (c.detectLlm ?? detectLlm)();
  if (llm) {
    c.log?.(`   local extraction will use ${llm.provider} (from ${llm.source})`);
  } else {
    c.log?.(
      `\u26A0\uFE0F  No LLM available for local fact extraction. Set OPENAI_API_KEY, ANTHROPIC_API_KEY or
    GEMINI_API_KEY (or install the Claude Code CLI, which needs no key).`
    );
  }
}
var devin = {
  name: "devin-cli",
  detect: (c) => onPath2("devin") || existsSync13(join24(c.home, ".config", "devin")),
  // Devin is the ONLY harness whose hooks never hand over a transcript: they carry a session id and
  // nothing else, so retain can only work by reading the CLI's own sessions.db. That makes SQLite
  // support a hard prerequisite here — and one worth checking now, because the alternative is an
  // install that looks perfectly healthy and stores nothing, forever (#3125).
  preflight(c) {
    if ((c.nodeSqlite ?? pathNodeHasSqlite)()) return void 0;
    return `\`node:sqlite\` is unavailable in the \`node\` on PATH (${pathNodeVersion()}).
   Devin keeps its conversations in ~/.local/share/devin/cli/sessions.db and its hooks pass
   only a session id, so without SQLite nothing could ever be retained.
   Upgrade to Node 22.5 or newer (24 LTS recommended) and re-run this command.`;
  },
  install(c) {
    const configPath = join24(c.home, ".config", "devin", "config.json");
    const config = readJson2(configPath);
    config.hooks = config.hooks ?? {};
    mergeHarnessHooks(config.hooks, "devin-cli", c.dist);
    writeJson(configPath, config);
    const mcpPath = join24(c.home, ".config", "devin", "mcp_config.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = {
      ...mcp.mcpServers ?? {},
      hindsight: mcpServerEntry(c.dist, "devin-cli")
    };
    writeJson(mcpPath, mcp);
    c.log?.(`devin-cli: hooks merged into ${configPath}, MCP into ${mcpPath}`);
  },
  uninstall(c) {
    const configPath = join24(c.home, ".config", "devin", "config.json");
    if (existsSync13(configPath)) {
      const config = readJson2(configPath);
      if (config.hooks) {
        stripHarnessHooks(config.hooks, "devin-cli");
        if (!Object.keys(config.hooks).length) delete config.hooks;
        writeJson(configPath, config);
      }
    }
    const mcpPath = join24(c.home, ".config", "devin", "mcp_config.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    c.log?.("devin-cli: hooks + MCP entry removed");
  }
};
var cursor = {
  name: "cursor-cli",
  detect: (c) => onPath2("cursor-agent") || existsSync13(join24(c.home, ".cursor")),
  install(c) {
    const hooksPath = join24(c.home, ".cursor", "hooks.json");
    const cfg = readJson2(hooksPath);
    cfg.version ??= 1;
    cfg.hooks = cfg.hooks ?? {};
    mergeHarnessHooks(cfg.hooks, "cursor-cli", c.dist);
    writeJson(hooksPath, cfg);
    const mcpPath = join24(c.home, ".cursor", "mcp.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = {
      ...mcp.mcpServers ?? {},
      hindsight: mcpServerEntry(c.dist, "cursor-cli", ["${workspaceFolder}"])
    };
    writeJson(mcpPath, mcp);
    c.log?.(`cursor-cli: hooks merged into ${hooksPath}, MCP into ${mcpPath}`);
    installSkill(c, "cursor-cli");
  },
  uninstall(c) {
    const hooksPath = join24(c.home, ".cursor", "hooks.json");
    if (existsSync13(hooksPath)) {
      const cfg = readJson2(hooksPath);
      if (cfg.hooks) {
        stripHarnessHooks(cfg.hooks, "cursor-cli");
        if (!Object.keys(cfg.hooks).length) delete cfg.hooks;
        writeJson(hooksPath, cfg);
      }
    }
    const mcpPath = join24(c.home, ".cursor", "mcp.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    uninstallSkill(c, "cursor-cli");
    c.log?.("cursor-cli: hooks + MCP entry + skill removed");
  }
};
var copilot = {
  name: "copilot-cli",
  detect: (c) => onPath2("copilot") || existsSync13(join24(c.home, ".copilot")),
  install(c) {
    const hooksPath = join24(c.home, ".copilot", "hooks", "hindsight-coding-agents.json");
    const hooks = {};
    mergeHarnessHooks(hooks, "copilot-cli", c.dist);
    writeJson(hooksPath, { version: 1, hooks });
    const mcpPath = join24(c.home, ".copilot", "mcp-config.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = {
      ...mcp.mcpServers ?? {},
      hindsight: mcpServerEntry(c.dist, "copilot-cli")
    };
    writeJson(mcpPath, mcp);
    installSkill(c, "copilot-cli");
    c.log?.(`copilot-cli: hooks installed at ${hooksPath}, MCP into ${mcpPath}`);
  },
  uninstall(c) {
    rmSync4(join24(c.home, ".copilot", "hooks", "hindsight-coding-agents.json"), {
      force: true
    });
    const mcpPath = join24(c.home, ".copilot", "mcp-config.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    uninstallSkill(c, "copilot-cli");
    c.log?.("copilot-cli: hooks + MCP entry + skill removed");
  }
};
var GROK_MARKER_START = "# HINDSIGHT_CODING_AGENTS_GROK_START";
var GROK_MARKER_END = "# HINDSIGHT_CODING_AGENTS_GROK_END";
var GROK_BLOCK_RE = new RegExp(`\\n?${GROK_MARKER_START}[\\s\\S]*?${GROK_MARKER_END}\\n?`, "g");
var GROK_HOOK_SCRIPT_RE = /(grok-(?:sessionstart-|stop-)?hook\.js|hindsight-coding-agents)/;
function parseGrokToml(text) {
  try {
    return parse2(text);
  } catch {
    return null;
  }
}
function hasUnmarkedGrokEntries(text) {
  const cfg = parseGrokToml(text);
  if (!cfg)
    return /\[\s*mcp_servers\s*\.\s*hindsight\s*[.\]]/.test(text) || GROK_HOOK_SCRIPT_RE.test(text);
  if (cfg.mcp_servers && "hindsight" in cfg.mcp_servers) return true;
  return Object.values(cfg.hooks ?? {}).some(
    (entries) => (entries ?? []).some(
      (entry) => (entry?.hooks ?? []).some(
        (h) => typeof h?.command === "string" && GROK_HOOK_SCRIPT_RE.test(h.command)
      )
    )
  );
}
function stripUnmarkedGrokEntries(toml) {
  const lines = toml.split("\n");
  const sections = [{ header: "", lines: [] }];
  for (const line of lines) {
    if (/^\s*\[/.test(line)) sections.push({ header: line.trim(), lines: [line] });
    else sections[sections.length - 1].lines.push(line);
  }
  const isOurs = (s) => s.lines.some((l) => /^\s*(command|args)\s*=/.test(l) && GROK_HOOK_SCRIPT_RE.test(l));
  const hasKeys = (s) => s.lines.slice(1).some((l) => /^\s*[^#\s]/.test(l));
  const drop = sections.map((s) => {
    if (/^\[mcp_servers\.hindsight(\.|\])/.test(s.header)) return true;
    if (/^\[\[hooks\..+\.hooks\]\]$/.test(s.header)) return isOurs(s);
    return false;
  });
  for (let i = 0; i < sections.length; i++) {
    if (!/^\[\[hooks\.[^.\]]+\]\]$/.test(sections[i].header) || hasKeys(sections[i])) continue;
    let j = i + 1;
    let sawChild = false;
    while (j < sections.length && /^\[\[hooks\..+\.hooks\]\]$/.test(sections[j].header)) {
      if (!drop[j]) break;
      sawChild = true;
      j++;
    }
    const childrenAllDropped = sawChild && (j >= sections.length || !/^\[\[hooks\..+\.hooks\]\]$/.test(sections[j].header));
    if (childrenAllDropped) drop[i] = true;
  }
  if (!drop.some(Boolean)) return toml;
  return sections.filter((_, i) => !drop[i]).map((s) => s.lines.join("\n")).join("\n").replace(/\n{3,}/g, "\n\n");
}
var grokHooksPath = (c) => join24(c.home, ".grok", "hooks", "hindsight.json");
var grok = {
  name: "grok-build",
  detect: (c) => onPath2("grok") || existsSync13(join24(c.home, ".grok")),
  install(c) {
    const path = join24(c.home, ".grok", "config.toml");
    const existing = existsSync13(path) ? readFileSync15(path, "utf8") : "";
    const stripped = existing.replace(GROK_BLOCK_RE, "\n");
    const withoutOurs = hasUnmarkedGrokEntries(stripped) ? stripUnmarkedGrokEntries(stripped) : stripped;
    const tomlString = (value) => JSON.stringify(value);
    const block = `
${GROK_MARKER_START}
[mcp_servers.hindsight]
command = "node"
args = [${tomlString(join24(c.dist, "mcp-server.js"))}]
env = { HINDSIGHT_MCP_HARNESS = "grok-build" }
${GROK_MARKER_END}
`;
    const next = `${withoutOurs.replace(/\n*$/, "\n")}${block}`;
    if (parseGrokToml(next) === null) {
      c.log?.(
        `grok-build: refusing to write ${path} \u2014 the result would not be valid TOML. Remove the Hindsight hooks and [mcp_servers.hindsight] from it by hand, then re-run install.`
      );
      return false;
    }
    if (existsSync13(path) && !existsSync13(`${path}.hindsight-backup`))
      copyFileSync(path, `${path}.hindsight-backup`);
    mkdirSync7(dirname13(path), { recursive: true });
    writeFileSync5(path, next);
    const hooksPath = grokHooksPath(c);
    const file = readJson2(hooksPath);
    const hooks = isPlainObject(file.hooks) ? file.hooks : {};
    mergeHarnessHooks(hooks, "grok-build", c.dist);
    writeJson(hooksPath, { ...file, hooks });
    installSkill(c, "grok-build");
    c.log?.(`grok-build: hooks installed in ${hooksPath}, MCP in ${path}`);
  },
  uninstall(c) {
    const path = join24(c.home, ".grok", "config.toml");
    if (existsSync13(path)) {
      const existing = readFileSync15(path, "utf8");
      const stripped = existing.replace(GROK_BLOCK_RE, "\n");
      const cleaned = hasUnmarkedGrokEntries(stripped) ? stripUnmarkedGrokEntries(stripped) : stripped;
      const safe = parseGrokToml(cleaned) !== null || parseGrokToml(existing) === null;
      if (cleaned !== existing && safe) writeFileSync5(path, cleaned);
    }
    const hooksPath = grokHooksPath(c);
    if (existsSync13(hooksPath)) {
      const file = readJson2(hooksPath);
      if (isPlainObject(file.hooks)) {
        stripHarnessHooks(file.hooks, "grok-build");
        if (!Object.keys(file.hooks).length) delete file.hooks;
      }
      if (Object.keys(file).length) writeJson(hooksPath, file);
      else rmSync4(hooksPath);
    }
    uninstallSkill(c, "grok-build");
    c.log?.("grok-build: native hooks + MCP + skill removed");
  }
};
var KIMI_MARKER_START = "# HINDSIGHT_CODING_AGENTS_KIMI_START";
var KIMI_MARKER_END = "# HINDSIGHT_CODING_AGENTS_KIMI_END";
var KIMI_BLOCK_RE = new RegExp(`\\n?${KIMI_MARKER_START}[\\s\\S]*?${KIMI_MARKER_END}\\n?`);
function kimiHome(c) {
  return process.env.KIMI_CODE_HOME || join24(c.home, ".kimi-code");
}
var kimi = {
  name: "kimi-code",
  detect: (c) => onPath2("kimi") || existsSync13(kimiHome(c)),
  install(c) {
    const path = join24(kimiHome(c), "config.toml");
    const existing = existsSync13(path) ? readFileSync15(path, "utf8") : "";
    const withoutOurs = existing.replace(KIMI_BLOCK_RE, "\n");
    const spec = HOOK_HARNESSES["kimi-code"];
    const entries = Object.values(spec.install).map(
      (h) => `[[hooks]]
event = ${JSON.stringify(h.event)}
command = ${JSON.stringify(`node "${join24(c.dist, h.entry)}"`)}
timeout = ${h.timeout}
`
    ).join("\n");
    const block = `
${KIMI_MARKER_START}
${entries}${KIMI_MARKER_END}
`;
    if (existsSync13(path) && !existsSync13(`${path}.hindsight-backup`))
      copyFileSync(path, `${path}.hindsight-backup`);
    mkdirSync7(dirname13(path), { recursive: true });
    writeFileSync5(path, `${withoutOurs.replace(/\n*$/, "\n")}${block}`);
    const mcpPath = join24(kimiHome(c), "mcp.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = { ...mcp.mcpServers ?? {}, hindsight: mcpServerEntry(c.dist, "kimi-code") };
    writeJson(mcpPath, mcp);
    installSkill(c, "kimi-code");
    c.log?.(`kimi-code: native hooks installed in ${path}, MCP in ${mcpPath}`);
  },
  uninstall(c) {
    const path = join24(kimiHome(c), "config.toml");
    if (existsSync13(path)) {
      const existing = readFileSync15(path, "utf8");
      const cleaned = existing.replace(KIMI_BLOCK_RE, "\n");
      if (cleaned !== existing) writeFileSync5(path, cleaned);
    }
    const mcpPath = join24(kimiHome(c), "mcp.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    uninstallSkill(c, "kimi-code");
    c.log?.("kimi-code: native hooks + MCP + skill removed");
  }
};
var CLINE_HOOK_MARKER = "HINDSIGHT_CODING_AGENTS_CLINE";
var CLINE_OLD_HOOK_EVENTS = ["TaskStart", "UserPromptSubmit", "TaskComplete"];
var CLINE_PLUGIN_NAME = "@vectorize-io/hindsight-coding-agents";
function removeLegacyClineHooks(c) {
  const hooksDir = join24(c.home, "Documents", "Cline", "Hooks");
  for (const event of CLINE_OLD_HOOK_EVENTS) {
    const path = join24(hooksDir, event);
    if (existsSync13(path) && readFileSync15(path, "utf8").includes(CLINE_HOOK_MARKER)) {
      rmSync4(path, { force: true });
    }
  }
}
var cline = {
  name: "cline-cli",
  detect: (c) => onPath2("cline") || existsSync13(join24(c.home, ".cline")),
  install(c) {
    removeLegacyClineHooks(c);
    const installed = (c.clinePlugin ?? runClinePlugin)([
      "plugin",
      "install",
      "--force",
      c.pkgRoot
    ]);
    const mcpPath = join24(c.home, ".cline", "data", "settings", "cline_mcp_settings.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = {
      ...mcp.mcpServers ?? {},
      hindsight: mcpServerEntry(c.dist, "cline-cli")
    };
    writeJson(mcpPath, mcp);
    installSkill(c, "cline-cli");
    c.log?.(
      installed ? "cline-cli: native plugin + MCP + skill installed" : `cline-cli: MCP + skill installed; run: cline plugin install --force "${c.pkgRoot}"`
    );
  },
  uninstall(c) {
    removeLegacyClineHooks(c);
    (c.clinePlugin ?? runClinePlugin)(["plugin", "uninstall", CLINE_PLUGIN_NAME]);
    const mcpPath = join24(c.home, ".cline", "data", "settings", "cline_mcp_settings.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (mcp.mcpServers?.hindsight) {
        delete mcp.mcpServers.hindsight;
        writeJson(mcpPath, mcp);
      }
    }
    uninstallSkill(c, "cline-cli");
    c.log?.("cline-cli: native plugin + MCP + skill removed");
  }
};
var DCODE_MARKETPLACE = "hindsight-coding-agents";
var DCODE_PLUGIN_ID = "hindsight-coding-agents@hindsight-coding-agents";
var DCODE_MARKETPLACE_RELATIVE_PATH = join24(".agents", "plugins", "marketplace.json");
var DCODE_FALLBACK_MARKETPLACE = "hindsight-coding-agents-marketplace.json";
function prepareDcodeMarketplace(c) {
  const root = join24(c.home, ".hindsight");
  const conventionalPath = join24(root, DCODE_MARKETPLACE_RELATIVE_PATH);
  let path = conventionalPath;
  let registrationSource = root;
  let marketplace = { plugins: [] };
  if (existsSync13(conventionalPath)) {
    try {
      const parsed = JSON.parse(readFileSync15(conventionalPath, "utf8"));
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.plugins)) {
        path = join24(root, DCODE_FALLBACK_MARKETPLACE);
      } else if (typeof parsed.name === "string" && parsed.name !== DCODE_MARKETPLACE) {
        path = join24(root, DCODE_FALLBACK_MARKETPLACE);
      } else {
        marketplace = parsed;
      }
    } catch {
      path = join24(root, DCODE_FALLBACK_MARKETPLACE);
    }
  }
  if (path !== conventionalPath && existsSync13(path)) {
    try {
      const parsed = JSON.parse(readFileSync15(path, "utf8"));
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.plugins) || parsed.name !== DCODE_MARKETPLACE) {
        c.log?.(`dcode: refusing to replace malformed marketplace file ${path}`);
        return false;
      }
      marketplace = parsed;
    } catch {
      c.log?.(`dcode: refusing to replace unreadable marketplace file ${path}`);
      return false;
    }
  }
  if (path !== conventionalPath) registrationSource = path;
  const foreign = marketplace.plugins.filter(
    (entry) => !entry || typeof entry !== "object" || entry.name !== "hindsight-coding-agents"
  );
  marketplace.name = DCODE_MARKETPLACE;
  marketplace.plugins = [
    ...foreign,
    {
      name: "hindsight-coding-agents",
      source: { source: "local", path: "./coding-agents" }
    }
  ];
  writeJson(path, marketplace);
  return registrationSource;
}
var dcode = {
  name: "dcode",
  detect: (c) => onPath2("dcode") || existsSync13(join24(c.home, ".deepagents")),
  preflight: (c) => c.dcodePlugin || onPath2("dcode") ? void 0 : "the `dcode` CLI is not on PATH",
  install(c) {
    const plugin = c.dcodePlugin ?? runDcodePlugin;
    const marketplacePath = prepareDcodeMarketplace(c);
    const installed = marketplacePath !== false && plugin(["plugin", "marketplace", "add", marketplacePath]) && plugin(["plugin", "install", DCODE_PLUGIN_ID]);
    if (installed) {
      c.log?.(`dcode: native Agent Plugin installed (${DCODE_PLUGIN_ID})`);
    } else {
      const source = marketplacePath === false ? join24(c.home, ".hindsight") : marketplacePath;
      c.log?.(
        `dcode: could not install the native plugin \u2014 run   dcode plugin marketplace add "${source}" && dcode plugin install ${DCODE_PLUGIN_ID}`
      );
    }
    return installed;
  },
  uninstall(c) {
    const plugin = c.dcodePlugin ?? runDcodePlugin;
    const removed = plugin(["plugin", "uninstall", DCODE_PLUGIN_ID]);
    const marketplaceRemoved = plugin(["plugin", "marketplace", "remove", DCODE_MARKETPLACE]);
    if (removed) {
      c.log?.("dcode: native Agent Plugin removed (foreign ~/.deepagents state preserved)");
      if (!marketplaceRemoved) {
        c.log?.(
          `dcode: the ${DCODE_MARKETPLACE} marketplace is still registered \u2014 remove it with \`dcode plugin marketplace remove ${DCODE_MARKETPLACE}\``
        );
      }
    } else {
      c.log?.(`dcode: could not run native uninstall for ${DCODE_PLUGIN_ID}`);
    }
    return removed;
  }
};
var DSH_MARKER_START = "# HINDSIGHT_CODING_AGENTS_DSH_START";
var DSH_MARKER_END = "# HINDSIGHT_CODING_AGENTS_DSH_END";
var DSH_BLOCK_RE = new RegExp(`\\n?${DSH_MARKER_START}[\\s\\S]*?${DSH_MARKER_END}\\n?`);
var DSH_EMPTY_LIST = "[]";
function dshUserPatches(existing) {
  const others = existing.replace(DSH_BLOCK_RE, "\n").trim();
  return others === DSH_EMPTY_LIST ? "" : others;
}
function dshHome(c) {
  return process.env.DSH_HOME || join24(c.home, ".dsh");
}
var dsh = {
  name: "dsh",
  detect: (c) => onPath2("dsh") || existsSync13(dshHome(c)),
  install(c) {
    const path = join24(dshHome(c), "cordis.patch.yml");
    const existing = existsSync13(path) ? readFileSync15(path, "utf8") : "";
    const others = dshUserPatches(existing);
    const entry = pathToFileURL(join24(c.dist, "dsh.js")).href;
    const block = `${DSH_MARKER_START}
- insert:
    - id: hindsight
      name: ${JSON.stringify(entry)}
${DSH_MARKER_END}
`;
    if (existsSync13(path) && !existsSync13(`${path}.hindsight-backup`))
      copyFileSync(path, `${path}.hindsight-backup`);
    mkdirSync7(dirname13(path), { recursive: true });
    writeFileSync5(path, others ? `${others}

${block}` : block);
    installSkill(c, "dsh");
    c.log?.(
      `dsh: plugin registered in ${path} (applies to every dsh profile; start new sessions \u2014 ones already open would gain the tools mid-conversation)`
    );
  },
  uninstall(c) {
    const path = join24(dshHome(c), "cordis.patch.yml");
    if (existsSync13(path)) {
      const existing = readFileSync15(path, "utf8");
      const others = existing.replace(DSH_BLOCK_RE, "\n").trim();
      if (others !== existing.trim())
        writeFileSync5(path, others ? `${others}
` : `${DSH_EMPTY_LIST}
`);
    }
    uninstallSkill(c, "dsh");
    c.log?.("dsh: plugin entry + skill removed");
  }
};
var qwen = {
  name: "qwen-code",
  detect: (c) => onPath2("qwen") || existsSync13(join24(c.home, ".qwen")),
  install(c) {
    const path = join24(c.home, ".qwen", "settings.json");
    const settings = readJson2(path);
    settings.hooks = settings.hooks ?? {};
    mergeHarnessHooks(settings.hooks, "qwen-code", c.dist);
    writeJson(path, settings);
    c.log?.(`qwen-code: hooks merged into ${path}`);
    installSkill(c, "qwen-code");
    const mcp = c.qwenMcp ?? defaultQwenMcp;
    mcp(["mcp", "remove", "hindsight"]);
    if (mcp([
      "mcp",
      "add",
      "-s",
      "user",
      "-e",
      "HINDSIGHT_MCP_HARNESS=qwen-code",
      "hindsight",
      "node",
      join24(c.dist, "mcp-server.js")
    ])) {
      c.log?.("qwen-code: MCP server registered (qwen mcp add, user scope)");
    } else {
      c.log?.(
        `qwen-code: could not run \`qwen mcp add\` \u2014 register the tools manually:
  qwen mcp add -s user -e HINDSIGHT_MCP_HARNESS=qwen-code hindsight node "${join24(c.dist, "mcp-server.js")}"`
      );
    }
  },
  uninstall(c) {
    const path = join24(c.home, ".qwen", "settings.json");
    if (existsSync13(path)) {
      const settings = readJson2(path);
      if (settings.hooks) {
        stripHarnessHooks(settings.hooks, "qwen-code");
        if (!Object.keys(settings.hooks).length) delete settings.hooks;
        writeJson(path, settings);
      }
    }
    const mcp = c.qwenMcp ?? defaultQwenMcp;
    mcp(["mcp", "remove", "hindsight"]);
    uninstallSkill(c, "qwen-code");
    c.log?.("qwen-code: hooks + MCP registration + skill removed");
  }
};
function defaultQwenMcp(args) {
  try {
    execFileSync8("qwen", args, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
var factoryDroid = {
  name: "factory-droid",
  detect: (c) => onPath2("droid") || existsSync13(join24(c.home, ".factory")),
  preflight(c) {
    const mcpPath = join24(c.home, ".factory", "mcp.json");
    const existing = readJson2(mcpPath).mcpServers?.hindsight;
    if (existing && !isOurMcpEntry(existing)) {
      return `${mcpPath} already contains a user-managed MCP server named "hindsight". Rename or remove that entry, then re-run install.`;
    }
  },
  install(c) {
    const hooksPath = join24(c.home, ".factory", "hooks.json");
    const hooks = readJson2(hooksPath);
    if (!existsSync13(hooksPath)) {
      const fallback = readJson2(join24(c.home, ".factory", "settings.json")).hooks;
      if (fallback && typeof fallback === "object" && !Array.isArray(fallback)) {
        Object.assign(hooks, fallback);
      }
    }
    mergeHarnessHooks(hooks, "factory-droid", c.dist);
    writeJson(hooksPath, hooks);
    c.log?.(`factory-droid: hooks merged into ${hooksPath}`);
    installSkill(c, "factory-droid");
    const mcpPath = join24(c.home, ".factory", "mcp.json");
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = mcp.mcpServers ?? {};
    mcp.mcpServers.hindsight = mcpServerEntry(c.dist, "factory-droid");
    writeJson(mcpPath, mcp);
    c.log?.(`factory-droid: MCP server registered in ${mcpPath}`);
  },
  uninstall(c) {
    const hooksPath = join24(c.home, ".factory", "hooks.json");
    if (existsSync13(hooksPath)) {
      const hooks = readJson2(hooksPath);
      stripHarnessHooks(hooks, "factory-droid");
      if (Object.keys(hooks).length) writeJson(hooksPath, hooks);
      else rmSync4(hooksPath);
    }
    const mcpPath = join24(c.home, ".factory", "mcp.json");
    if (existsSync13(mcpPath)) {
      const mcp = readJson2(mcpPath);
      if (isOurMcpEntry(mcp.mcpServers?.hindsight)) {
        delete mcp.mcpServers.hindsight;
        if (Object.keys(mcp.mcpServers).length) writeJson(mcpPath, mcp);
        else rmSync4(mcpPath);
      }
    }
    uninstallSkill(c, "factory-droid");
    c.log?.("factory-droid: hooks + MCP registration + skill removed");
  }
};
var zcode = {
  name: "zcode",
  detect: (c) => onPath2("zcode") || existsSync13(join24(c.home, ".zcode")),
  preflight(c) {
    const configPath = zcodeConfigPath(c);
    const existing = readJson2(configPath).mcp?.servers?.hindsight;
    if (existing && !isOurMcpEntry(existing)) {
      return `${configPath} already contains a user-managed MCP server named "hindsight". Rename or remove that entry, then re-run install.`;
    }
  },
  install(c) {
    const configPath = zcodeConfigPath(c);
    const config = readJson2(configPath);
    const hooks = config.hooks = config.hooks ?? {};
    hooks.enabled = true;
    hooks.maxOutputBytes = hooks.maxOutputBytes ?? ZCODE_MAX_OUTPUT_BYTES;
    hooks.events = hooks.events ?? {};
    mergeHarnessHooks(hooks.events, "zcode", c.dist);
    config.mcp = config.mcp ?? {};
    config.mcp.servers = config.mcp.servers ?? {};
    config.mcp.servers.hindsight = mcpServerEntry(c.dist, "zcode");
    writeJson(configPath, config);
    c.log?.(`zcode: hooks + MCP server merged into ${configPath}`);
    installSkill(c, "zcode");
  },
  uninstall(c) {
    const configPath = zcodeConfigPath(c);
    if (existsSync13(configPath)) {
      const config = readJson2(configPath);
      if (isOurMcpEntry(config.mcp?.servers?.hindsight)) {
        delete config.mcp.servers.hindsight;
        if (!Object.keys(config.mcp.servers).length) delete config.mcp;
      }
      const hooks = config.hooks;
      if (hooks?.events) {
        stripHarnessHooks(hooks.events, "zcode");
        if (!Object.keys(hooks.events).length) delete config.hooks;
      }
      writeJson(configPath, config);
    }
    uninstallSkill(c, "zcode");
    c.log?.(`zcode: hooks + MCP registration + skill removed`);
  }
};
var traecodeMcpPath = (c) => join24(traecodeUserDataDir(c.home), "User", "mcp.json");
function removeTraecodeUserMcpEntry(c) {
  try {
    const mcpPath = traecodeMcpPath(c);
    if (!existsSync13(mcpPath)) return false;
    const mcp = readJson2(mcpPath);
    if (!isOurMcpEntry(mcp.mcpServers?.hindsight)) return false;
    delete mcp.mcpServers.hindsight;
    if (Object.keys(mcp.mcpServers).length) writeJson(mcpPath, mcp);
    else rmSync4(mcpPath);
    return true;
  } catch {
    return false;
  }
}
function ensureTraecodeWorkspaceMcpGate(c) {
  const settingsPath = traecodeUserSettingsPath(c.home);
  if (workspaceMcpGateState(settingsPath) === "on") return;
  const ask = "\n  Trae ignores per-repo MCP configs until workspace MCP is enabled, which keeps\n  hindsight's MCP tools hidden. Enable it globally now? (one-time setting)\n";
  const skipNote = '  Skipped. Enable later in Trae settings (search "enableWorkspaceMcp") or re-run with\n  --enable-workspace-mcp.';
  if (!(c.args ?? []).includes("--enable-workspace-mcp")) {
    if (c.interactive !== true) {
      c.log?.(`${ask}  ${skipNote}`);
      return;
    }
    const answer = readLineSync(c, `${ask}  Enable workspace MCP? [Y/n]: `).trim().toLowerCase();
    if (answer === "n" || answer === "no") {
      c.log?.(skipNote);
      return;
    }
  }
  if (enableWorkspaceMcpSetting(settingsPath)) {
    markWorkspaceMcpEnabled({ stateFile: gateStateFileFor(c.dist) });
    c.log?.(
      `traecode: workspace MCP enabled in ${settingsPath} \u2014 restart Trae windows to pick it up`
    );
  } else {
    c.log?.(
      `traecode: could not update ${settingsPath} (comments or unreadable JSON) \u2014 set
  "trae.mcp.enableWorkspaceMcp": true in Trae settings instead.`
    );
  }
}
var traecode = {
  name: "traecode",
  detect: (c) => existsSync13(join24(c.home, traecodeDotDirName(c.home))) || onPath2("trae"),
  install(c) {
    const hooksPath = join24(c.home, traecodeDotDirName(c.home), "hooks.json");
    const doc = readJson2(hooksPath);
    doc.version = doc.version ?? 1;
    const hooks = doc.hooks = doc.hooks ?? {};
    mergeHarnessHooks(hooks, "traecode", c.dist);
    writeJson(hooksPath, doc);
    c.log?.(`traecode: hooks merged into ${hooksPath}`);
    installSkill(c, "traecode");
    if (removeTraecodeUserMcpEntry(c)) {
      c.log?.(
        `traecode: stale user-level MCP entry removed from ${traecodeMcpPath(c)} \u2014 per-repo
  .trae/mcp.json files register the server instead`
      );
    }
    const sandboxPath = join24(c.home, traecodeDotDirName(c.home), "sandbox.json");
    const sandbox = readJson2(sandboxPath);
    const fsRules = sandbox.filesystem = sandbox.filesystem ?? {};
    const readWrite = fsRules.readWrite = fsRules.readWrite ?? [];
    const needed = [join24(c.home, ".hindsight"), traecodeWorkspaceStorageDir(c.home)];
    let sandboxChanged = false;
    for (const dir of needed) {
      if (!readWrite.includes(dir)) {
        readWrite.push(dir);
        sandboxChanged = true;
      }
    }
    if (sandboxChanged) {
      writeJson(sandboxPath, sandbox);
      c.log?.(`traecode: sandbox readWrite rules added (${needed.join(", ")})`);
    }
    const config = readJson2(hindsightConfigPath(c));
    const repos = Object.keys(config.mapPathToBank ?? {}).sort();
    if (repos.length) {
      const written = [];
      const current2 = [];
      const skipped = [];
      let seeded = 0;
      for (const repo of repos) {
        if (!existsSync13(repo)) {
          skipped.push(repo);
          continue;
        }
        const outcome = registerTraecodeWorkspaceMcp(repo, { home: c.home, dist: c.dist });
        if (outcome === "registered") written.push(repo);
        else if (outcome === "current") current2.push(repo);
        else skipped.push(repo);
        if (ensureWorkspaceMcpEnabled(repo, { home: c.home }) !== "failed") seeded++;
      }
      c.log?.(
        `traecode: per-repo MCP registration \u2014 ${written.length} written, ${current2.length} already current, ${skipped.length} skipped across ${repos.length} opted-in repo(s); enable switch on for ${seeded}`
      );
      if (written.length) c.log?.(`  registered: ${written.join(", ")}`);
      if (skipped.length) {
        c.log?.(
          `  skipped (missing repo, no dist build, or a foreign hindsight entry): ` + skipped.join(", ")
        );
      }
      if (written.length) {
        c.log?.(
          "  new registrations appear in the next Trae window \u2014 if a repo's server still shows\n  disabled in the MCP panel, flip it on once there"
        );
      }
    }
    ensureTraecodeWorkspaceMcpGate(c);
  },
  uninstall(c) {
    const hooksPath = join24(c.home, traecodeDotDirName(c.home), "hooks.json");
    if (existsSync13(hooksPath)) {
      const doc = readJson2(hooksPath);
      if (doc.hooks) {
        stripHarnessHooks(doc.hooks, "traecode");
        if (!Object.keys(doc.hooks).length) delete doc.hooks;
      }
      if (Object.keys(doc).length > 1) writeJson(hooksPath, doc);
      else rmSync4(hooksPath);
    }
    if (removeTraecodeUserMcpEntry(c)) {
      c.log?.(`traecode: MCP entry removed from ${traecodeMcpPath(c)}`);
    }
    const config = readJson2(hindsightConfigPath(c));
    const repoEntries = Object.keys(config.mapPathToBank ?? {}).sort();
    const cleaned = repoEntries.filter(
      (repo) => removeTraecodeWorkspaceMcpEntry(repo, { home: c.home })
    );
    if (cleaned.length) {
      c.log?.(`traecode: per-repo MCP registration removed from:
  ${cleaned.join("\n  ")}`);
    }
    const sandboxPath = join24(c.home, traecodeDotDirName(c.home), "sandbox.json");
    if (existsSync13(sandboxPath)) {
      const sandbox = readJson2(sandboxPath);
      const readWrite = sandbox.filesystem?.readWrite;
      if (Array.isArray(readWrite)) {
        const ours = [join24(c.home, ".hindsight"), traecodeWorkspaceStorageDir(c.home)];
        const filtered = readWrite.filter((p) => !ours.includes(p));
        if (filtered.length !== readWrite.length) {
          sandbox.filesystem.readWrite = filtered;
          writeJson(sandboxPath, sandbox);
        }
      }
    }
    removeWorkspaceMcpEnabledKeys(c.home);
    uninstallSkill(c, "traecode");
    c.log?.(`traecode: hooks + MCP registration + skill removed`);
  }
};
var genieInstaller = (name, homeDir, mcpPaths) => ({
  name,
  detect: (c) => existsSync13(join24(c.home, homeDir)),
  install(c) {
    const settingsPath = join24(c.home, homeDir, "settings.json");
    const settings = readJson2(settingsPath);
    settings.hooks = settings.hooks ?? {};
    mergeHarnessHooks(settings.hooks, name, c.dist);
    writeJson(settingsPath, settings);
    c.log?.(`${name}: hooks merged into ${settingsPath}`);
    const paths = mcpPaths(c.home);
    const mcpPath = paths.find((p) => existsSync13(p)) ?? paths[0];
    const mcp = readJson2(mcpPath);
    mcp.mcpServers = mcp.mcpServers ?? {};
    mcp.mcpServers.hindsight = mcpServerEntry(c.dist, name);
    writeJson(mcpPath, mcp);
    c.log?.(`${name}: MCP server registered in ${mcpPath}`);
    installSkill(c, name);
  },
  uninstall(c) {
    const settingsPath = join24(c.home, homeDir, "settings.json");
    if (existsSync13(settingsPath)) {
      const settings = readJson2(settingsPath);
      if (settings.hooks) {
        stripHarnessHooks(settings.hooks, name);
        if (!Object.keys(settings.hooks).length) delete settings.hooks;
        writeJson(settingsPath, settings);
      }
    }
    for (const mcpPath of mcpPaths(c.home)) {
      if (!existsSync13(mcpPath)) continue;
      const mcp = readJson2(mcpPath);
      if (isOurMcpEntry(mcp.mcpServers?.hindsight)) {
        delete mcp.mcpServers.hindsight;
        if (!Object.keys(mcp.mcpServers).length) delete mcp.mcpServers;
        writeJson(mcpPath, mcp);
      }
    }
    uninstallSkill(c, name);
    c.log?.(`${name}: hooks + MCP registration + skill removed`);
  }
});
var workbuddy = genieInstaller("workbuddy", ".workbuddy", (home) => [
  join24(home, ".workbuddy", "mcp.json")
]);
var codebuddy = genieInstaller("codebuddy", ".codebuddy", (home) => [
  join24(home, ".codebuddy", ".mcp.json"),
  join24(home, ".codebuddy", "mcp.json"),
  join24(home, ".codebuddy.json")
]);
var INSTALLERS = [
  opencode,
  opencode2,
  kilo,
  pi,
  primeAgent,
  claudeCode,
  codex,
  antigravity,
  devin,
  cursor,
  copilot,
  grok,
  qwen,
  kimi,
  cline,
  dcode,
  dsh,
  factoryDroid,
  zcode,
  traecode,
  workbuddy,
  codebuddy
];
var HARNESS_ALIASES = { agy: "antigravity-cli" };
function importConversations(harness, ctx) {
  const repo = process.cwd();
  const found = importLocalHistory(harness, repo);
  if (!found.supported) {
    ctx.log?.(`${harness}: --import-conversations skipped \u2014 ${found.reason}`);
    return;
  }
  if (found.unattributed) {
    ctx.log?.(
      `${harness}: skipped ${found.unattributed} session(s) that do not record which directory they ran in \u2014 importing them could file another repo's conversation into this bank`
    );
  }
  if (!found.sessions.length) {
    ctx.log?.(`${harness}: no past sessions found on disk for ${repo}`);
    return;
  }
  const turns = found.sessions.reduce((n, s) => n + s.turns.length, 0);
  const file = join24(mkdtempSync2(join24(tmpdir5(), "hindsight-import-")), "conversations.json");
  writeFileSync5(file, JSON.stringify(found.sessions));
  ctx.log?.(
    `${harness}: importing ${found.sessions.length} past sessions (${turns} turns) from ${repo} \u2014 this runs extraction and may take a while`
  );
  try {
    execFileSync8("node", [join24(ctx.dist, "deepen.js"), "--repo", repo, "--conversations", file], {
      stdio: "inherit"
    });
  } catch {
    ctx.log?.(`${harness}: conversation import did not finish \u2014 re-run it any time with:`);
    ctx.log?.(`  node "${join24(ctx.dist, "deepen.js")}" --repo "${repo}" --conversations "${file}"`);
  }
}
function run(argv, ctxIn) {
  let ctx = ctxIn;
  const [command, ...rawArgs] = argv;
  ctx = { ...ctx, args: rawArgs };
  const importHistory = rawArgs.includes("--import-conversations");
  const valueArgs = flagValueArgs(rawArgs, ["server", "api-url", "api-token"]);
  const names = rawArgs.filter((a) => !a.startsWith("--") && !valueArgs.has(a));
  if (command === "stats") {
    ctx.log?.(formatUsageReport(readUsage()));
    return 0;
  }
  if (command === "install" || command === "update") ctx = stageRuntime(ctx);
  if (command === "update") {
    ctx.log?.(
      ctx.pkgRoot === ctxIn.pkgRoot ? "runtime already up to date \u2014 nothing staged" : "runtime updated \u2014 every wired agent picks it up on its next session"
    );
    return 0;
  }
  if (command !== "install" && command !== "uninstall") {
    ctx.log?.(
      `usage: hindsight-coding-agents <install|uninstall> <all|harness...>
       hindsight-coding-agents update
       hindsight-coding-agents stats
       [--server cloud|self-hosted|daemon] [--api-url <url>] [--api-token <token>]
       [--import-conversations] [--enable-workspace-mcp]
  all      every agent detected on this machine
  harness  ${INSTALLERS.map((i) => i.name).join(", ")} (agy aliases antigravity-cli)
  update   re-stage the runtime only, leaving every host config untouched
  agents/CI: without a TTY nothing ever prompts \u2014 pass --server (and --api-url/--api-token) to choose`
    );
    return command ? 1 : 0;
  }
  let targets;
  if (names.includes("all")) {
    targets = INSTALLERS.filter((i) => i.detect(ctx));
    if (!targets.length) {
      ctx.log?.("no supported coding agents detected \u2014 name one explicitly to wire it anyway");
      return 1;
    }
    ctx.log?.(`detected: ${targets.map((t) => t.name).join(", ")}`);
  } else if (names.length) {
    targets = [];
    for (const n of names) {
      const hit = INSTALLERS.find((i) => i.name === (HARNESS_ALIASES[n] ?? n));
      if (!hit) {
        ctx.log?.(
          `unknown harness "${n}" \u2014 expected "all" or one of: ${INSTALLERS.map((i) => i.name).join(", ")} (agy aliases antigravity-cli)`
        );
        return 1;
      }
      targets.push(hit);
    }
  } else {
    ctx.log?.(
      `${command}: name a harness, or "all" for every agent detected on this machine.
  hindsight-coding-agents ${command} claude-code
  hindsight-coding-agents ${command} all
harnesses: ${INSTALLERS.map((i) => i.name).join(", ")} (agy aliases antigravity-cli)`
    );
    return 1;
  }
  const blocked = /* @__PURE__ */ new Set();
  if (command === "install") {
    for (const t of targets) {
      const problem = t.preflight?.(ctx);
      if (!problem) continue;
      ctx.log?.(`
\u274C ${t.name}: ${problem}`);
      blocked.add(t.name);
    }
  }
  const runnable = targets.filter((t) => !blocked.has(t.name));
  if (command === "install" && runnable.length > 0 && !configureServer(
    ctx,
    rawArgs,
    runnable.map((t) => t.name)
  ))
    return 1;
  const failed = [];
  for (const t of runnable) {
    if (t[command](ctx) === false) failed.push(t.name);
  }
  if (command === "install" && importHistory) {
    for (const t of runnable) importConversations(t.name, ctx);
  }
  if (blocked.size || failed.length) {
    const notInstalled = [...blocked, ...failed];
    ctx.log?.(`
\u274C not installed: ${notInstalled.join(", ")} \u2014 see the messages above.`);
    return 1;
  }
  return 0;
}
var mainPath = process.argv[1] ? (() => {
  try {
    return realpathSync3(process.argv[1]);
  } catch {
    return process.argv[1];
  }
})() : void 0;
var isMain = mainPath && import.meta.url === pathToFileURL(mainPath).href;
if (isMain || mainPath?.endsWith("installer.js")) {
  const dist = dirname13(fileURLToPath7(import.meta.url));
  const pkgRoot = dirname13(dist);
  let version2;
  try {
    version2 = JSON.parse(readFileSync15(join24(pkgRoot, "package.json"), "utf8")).version;
  } catch {
    version2 = void 0;
  }
  const ui = createInstallerUi({
    home: homedir13(),
    command: process.argv[2],
    version: version2,
    harnessNames: INSTALLERS.map((i) => i.name),
    // configureServer's messages render as their own "server" group, but don't count as an agent.
    auxNames: ["server"],
    configPath: process.env.HINDSIGHT_CONFIG || void 0
  });
  ui.intro();
  const code = run(process.argv.slice(2), {
    home: homedir13(),
    pkgRoot,
    dist,
    // Only a real terminal gets prompted; piped/CI installs take the documented default.
    // tty.isatty, NOT process.stdin.isTTY: the process.stdin getter initializes the stdin TTY
    // stream, which puts fd 0 in non-blocking mode and breaks readLineSync (see there).
    interactive: Boolean(isatty(0) && isatty(1)),
    log: ui.log,
    promptStyle: ui.prompt,
    selectPrompt: ui.select
  });
  ui.outro(code);
  process.exit(code);
}
export {
  INSTALLERS,
  KILO_CONFIG_CANDIDATES,
  MARKER,
  OPENCODE_CONFIG_CANDIDATES,
  ORIGIN_FILE,
  flagValue,
  flagValueArgs,
  parseJsonc,
  run,
  runtimeDir
};
/*! Bundled license information:

smol-toml/dist/error.js:
smol-toml/dist/primitive.js:
smol-toml/dist/date.js:
smol-toml/dist/extract.js:
smol-toml/dist/util.js:
smol-toml/dist/struct.js:
smol-toml/dist/parse.js:
smol-toml/dist/stringify.js:
smol-toml/dist/index.js:
  (*!
   * Copyright (c) Squirrel Chat et al., All rights reserved.
   * SPDX-License-Identifier: BSD-3-Clause
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this
   *    list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   * 3. Neither the name of the copyright holder nor the names of its contributors
   *    may be used to endorse or promote products derived from this software without
   *    specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
   * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
   * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
   * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/
