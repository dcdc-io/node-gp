"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var CardCrypto = /** @class */ (function () {
    function CardCrypto() {
    }
    /**
     * Calculates a DES session key as per GP Card Spec 2.1.1 E.4.1.
     * @param data the input data
     * @param key the cipher key
     */
    CardCrypto.tripleDesCbc = function (data, key) {
        var cipher = crypto_1.createCipheriv('des-ede-cbc', key, Buffer.alloc(8));
        cipher.setAutoPadding(false);
        var b = cipher.update(data);
        var f = cipher.final();
        return Buffer.concat([b, f], b.length + f.length);
    };
    CardCrypto.getRetailMac = function (keystr, datastr, ivstr) {
        // bit pad
        var datastrpadded = datastr + "8000000000000000";
        datastrpadded = datastrpadded.substring(0, datastrpadded.length - (datastrpadded.length % 16));
        var key = Buffer.from(keystr, "hex");
        var data = Buffer.from(datastrpadded, "hex");
        var iv = Buffer.from(ivstr, "hex");
        var k1 = key.slice(0, 8);
        var k2 = key.slice(8, 16);
        var c1 = function () {
            var c = crypto_1.createCipheriv("des-cbc", k1, Buffer.alloc(8));
            c.setAutoPadding(false);
            return c;
        };
        var c2 = function () {
            var c = crypto_1.createDecipheriv("des-cbc", k2, Buffer.alloc(8));
            c.setAutoPadding(false);
            return c;
        };
        var bc = data.length / 8;
        var transformation1 = c1().update(data.slice(0, 8));
        var buffer = Buffer.alloc(8);
        for (var i = 1; i < bc; i++) {
            var block = data.slice(8 * i, 8 * (i + 1));
            for (var j = 0; j < 8; j++) {
                buffer[j] = transformation1[j] ^ block[j];
            }
            transformation1 = c1().update(buffer);
        }
        var transformation3d = c2().update(transformation1);
        var transformation3 = c1().update(transformation3d);
        return transformation3;
    };
    CardCrypto.installForLoad = function (card, zdata) {
        return __awaiter(this, void 0, void 0, function () {
            var modulenames, modules, aid, sw, apdu;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modulenames = ["Header", "Directory", "Import", "Applet", "Class", "Method", "StaticField", "Export", "ConstantPool", "RefLocation"];
                        return [4 /*yield*/, modulenames
                                .map(function (mod, o) { return [mod, zdata.filter(function (f) { return f.endsWith(mod + ".cap"); })[0], o]; })
                                .filter(function (x) { return x[1]; })
                                .reduce(function (p, c) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _a = p;
                                            _b = c[2];
                                            _c = {
                                                module: c[0]
                                            };
                                            return [4 /*yield*/, c[1].async("nodebuffer")];
                                        case 1:
                                            _a[_b] = (_c.data = _d.sent(),
                                                _c);
                                            return [2 /*return*/, p];
                                    }
                                });
                            }); }, [])];
                    case 1:
                        modules = _a.sent();
                        console.log(modules);
                        aid = modules.find(function (m) { return m.module === "Header"; }).data.slice(13, 13 + modules.find(function (m) { return m.module === "Header"; }).data[12]);
                        sw = null;
                        apdu = "80e60200" + (aid.length + 5 + 256).toString(16).substring(1) + (aid.length + 256).toString(16).substring(1) + aid.toString("hex") + "0000000001";
                        return [4 /*yield*/, card.issueCommand(apdu)
                            // TODO: check sw == 00 90 00
                        ];
                    case 2:
                        sw = _a.sent();
                        // TODO: check sw == 00 90 00
                        return [2 /*return*/, new Buffer(0)];
                }
            });
        });
    };
    return CardCrypto;
}());
exports.CardCrypto = CardCrypto;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZENyeXB0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL0NhcmRDcnlwdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUF5RDtBQUd6RDtJQUFBO0lBZ0ZBLENBQUM7SUEvRUc7Ozs7T0FJRztJQUNJLHVCQUFZLEdBQW5CLFVBQW9CLElBQVEsRUFBRSxHQUFPO1FBQ2pDLElBQU0sTUFBTSxHQUFHLHVCQUFjLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM1QixJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzdCLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUN4QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDckQsQ0FBQztJQUNNLHVCQUFZLEdBQW5CLFVBQW9CLE1BQWEsRUFBRSxPQUFjLEVBQUUsS0FBWTtRQUMzRCxVQUFVO1FBQ1YsSUFBSSxhQUFhLEdBQUcsT0FBTyxHQUFHLGtCQUFrQixDQUFBO1FBQ2hELGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTlGLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3BDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMs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QUssQ0FBQyxlQUFZLENBQUE7d0JBQ2xKLHFCQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDOzRCQUNsQyw2QkFBNkI7MEJBREs7O3dCQUFsQyxFQUFFLEdBQUcsU0FBNkIsQ0FBQTt3QkFDbEMsNkJBQTZCO3dCQUc3QixzQkFBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQTs7OztLQUN2QjtJQUNMLGlCQUFDO0FBQUQsQ0FBQyxBQWhGRCxJQWdGQztBQWhGWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNpcGhlcml2LCBjcmVhdGVEZWNpcGhlcml2IH0gZnJvbSBcImNyeXB0b1wiXHJcbmltcG9ydCBKU1ppcCwgeyBKU1ppcE9iamVjdCB9IGZyb20gXCJqc3ppcFwiXHJcblxyXG5leHBvcnQgY2xhc3MgQ2FyZENyeXB0byB7XHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYSBERVMgc2Vzc2lvbiBrZXkgYXMgcGVyIEdQIENhcmQgU3BlYyAyLjEuMSBFLjQuMS5cclxuICAgICAqIEBwYXJhbSBkYXRhIHRoZSBpbnB1dCBkYXRhXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBjaXBoZXIga2V5XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB0cmlwbGVEZXNDYmMoZGF0YTphbnksIGtleTphbnkpIHsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNpcGhlciA9IGNyZWF0ZUNpcGhlcml2KCdkZXMtZWRlLWNiYycsIGtleSwgQnVmZmVyLmFsbG9jKDgpKVxyXG4gICAgICAgIGNpcGhlci5zZXRBdXRvUGFkZGluZyhmYWxzZSlcclxuICAgICAgICBjb25zdCBiID0gY2lwaGVyLnVwZGF0ZShkYXRhKVxyXG4gICAgICAgIGNvbnN0IGYgPSBjaXBoZXIuZmluYWwoKVxyXG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtiLCBmXSwgYi5sZW5ndGggKyBmLmxlbmd0aClcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRSZXRhaWxNYWMoa2V5c3RyOnN0cmluZywgZGF0YXN0cjpzdHJpbmcsIGl2c3RyOnN0cmluZykge1xyXG4gICAgICAgIC8vIGJpdCBwYWRcclxuICAgICAgICBsZXQgZGF0YXN0cnBhZGRlZCA9IGRhdGFzdHIgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIlxyXG4gICAgICAgIGRhdGFzdHJwYWRkZWQgPSBkYXRhc3RycGFkZGVkLnN1YnN0cmluZygwLCBkYXRhc3RycGFkZGVkLmxlbmd0aCAtIChkYXRhc3RycGFkZGVkLmxlbmd0aCAlIDE2KSlcclxuICAgICAgICBcclxuICAgICAgICBsZXQga2V5ID0gQnVmZmVyLmZyb20oa2V5c3RyLCBcImhleFwiKVxyXG4gICAgICAgIGxldCBkYXRhID0gQnVmZmVyLmZyb20oZGF0YXN0cnBhZGRlZCwgXCJoZXhcIilcclxuICAgICAgICBsZXQgaXYgPSBCdWZmZXIuZnJvbShpdnN0ciwgXCJoZXhcIilcclxuICAgIFxyXG4gICAgICAgIGxldCBrMSA9IGtleS5zbGljZSgwLCA4KVxyXG4gICAgICAgIGxldCBrMiA9IGtleS5zbGljZSg4LCAxNilcclxuICAgIFxyXG4gICAgICAgIGxldCBjMSA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGMgPSBjcmVhdGVDaXBoZXJpdihcImRlcy1jYmNcIiwgazEsIEJ1ZmZlci5hbGxvYyg4KSlcclxuICAgICAgICAgICAgYy5zZXRBdXRvUGFkZGluZyhmYWxzZSlcclxuICAgICAgICAgICAgcmV0dXJuIGNcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGMyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgYyA9IGNyZWF0ZURlY2lwaGVyaXYoXCJkZXMtY2JjXCIsIGsyLCBCdWZmZXIuYWxsb2MoOCkpXHJcbiAgICAgICAgICAgIGMuc2V0QXV0b1BhZGRpbmcoZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybiBjXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBiYyA9IGRhdGEubGVuZ3RoIC8gOFxyXG4gICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWF0aW9uMSA9IGMxKCkudXBkYXRlKGRhdGEuc2xpY2UoMCwgOCkpXHJcbiAgICAgICAgbGV0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYmM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYmxvY2sgPSBkYXRhLnNsaWNlKDggKiBpLCA4ICogKGkgKyAxKSlcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHRyYW5zZm9ybWF0aW9uMVtqXSBeIGJsb2NrW2pdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJhbnNmb3JtYXRpb24xID0gYzEoKS51cGRhdGUoYnVmZmVyKSAgICBcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBsZXQgdHJhbnNmb3JtYXRpb24zZCA9IGMyKCkudXBkYXRlKHRyYW5zZm9ybWF0aW9uMSlcclxuICAgICAgICBsZXQgdHJhbnNmb3JtYXRpb24zID0gYzEoKS51cGRhdGUodHJhbnNmb3JtYXRpb24zZClcclxuICAgIFxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvbjNcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgaW5zdGFsbEZvckxvYWQoY2FyZDphbnksIHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZW5hbWVzID0gW1wiSGVhZGVyXCIsIFwiRGlyZWN0b3J5XCIsIFwiSW1wb3J0XCIsIFwiQXBwbGV0XCIsIFwiQ2xhc3NcIiwgXCJNZXRob2RcIiwgXCJTdGF0aWNGaWVsZFwiLCBcIkV4cG9ydFwiLCBcIkNvbnN0YW50UG9vbFwiLCBcIlJlZkxvY2F0aW9uXCJdXHJcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IGF3YWl0IG1vZHVsZW5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG1vZCwgbykgPT4gW21vZCwgemRhdGEuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aChgJHttb2R9LmNhcGApKVswXSwgb10pXHJcbiAgICAgICAgICAgIC5maWx0ZXIoeCA9PiB4WzFdKVxyXG4gICAgICAgICAgICAucmVkdWNlKGFzeW5jIChwLCBjKSA9PiB7IFxyXG4gICAgICAgICAgICAgICAgcFtjWzJdIGFzIG51bWJlcl0gPSB7IFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogY1swXSBhcyBzdHJpbmcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGF3YWl0IChjWzFdIGFzIEpTWmlwT2JqZWN0KS5hc3luYyhcIm5vZGVidWZmZXJcIikgXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgXHJcbiAgICAgICAgICAgIH0sIFtdIGFzIGFueSlcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgYWlkID0gbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpLmRhdGEuc2xpY2UoMTMsIDEzICsgbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpLmRhdGFbMTJdKVxyXG5cclxuICAgICAgICBsZXQgc3c6YW55ID0gbnVsbFxyXG4gICAgICAgIGxldCBhcGR1ID0gYDgwZTYwMjAwJHsoYWlkLmxlbmd0aCArIDUgKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHsoYWlkLmxlbmd0aCArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0ke2FpZC50b1N0cmluZyhcImhleFwiKX0wMDAwMDAwMDAxYFxyXG4gICAgICAgIHN3ID0gYXdhaXQgY2FyZC5pc3N1ZUNvbW1hbmQoYXBkdSlcclxuICAgICAgICAvLyBUT0RPOiBjaGVjayBzdyA9PSAwMCA5MCAwMFxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcclxuICAgIH1cclxufSJdfQ==