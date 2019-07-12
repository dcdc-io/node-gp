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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZGNyeXB0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2NhcmRjcnlwdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUF5RDtBQUd6RDtJQUFBO0lBb0VBLENBQUM7SUFuRVUsdUJBQVksR0FBbkIsVUFBb0IsTUFBYSxFQUFFLE9BQWMsRUFBRSxLQUFZO1FBQzNELFVBQVU7UUFDVixJQUFJLGFBQWEsR0FBRyxPQUFPLEdBQUcsa0JBQWtCLENBQUE7UUFDaEQsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFOUYsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDcEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDNUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFbEMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFekIsSUFBSSxFQUFFLEdBQUc7WUFDTCxJQUFJLENBQUMsR0FBRyx1QkFBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RELENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsT0FBTyxDQUFDLENBQUE7UUFDWixDQUFDLENBQUE7UUFDRCxJQUFJLEVBQUUsR0FBRztZQUNMLElBQUksQ0FBQyxHQUFHLHlCQUFnQixDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3hELENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsT0FBTyxDQUFDLENBQUE7UUFDWixDQUFDLENBQUE7UUFFRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUV4QixJQUFJLGVBQWUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzVDO1lBQ0QsZUFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN4QztRQUVELElBQUksZ0JBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQ25ELElBQUksZUFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBRW5ELE9BQU8sZUFBZSxDQUFBO0lBQzFCLENBQUM7SUFFWSx5QkFBYyxHQUEzQixVQUE0QixJQUFRLEVBQUUsS0FBVzs7Ozs7Ozt3QkFDdkMsV0FBVyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUE7d0JBQzFILHFCQUFNLFdBQVc7aUNBQzVCLEdBQUcsQ0FBQyxVQUFDLEdBQUcsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBSSxHQUFHLFNBQU0sQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXhELENBQXdELENBQUM7aUNBQ3pFLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBSixDQUFJLENBQUM7aUNBQ2pCLE1BQU0sQ0FBQyxVQUFPLENBQUMsRUFBRSxDQUFDOzs7Ozs0Q0FDZixLQUFBLENBQUMsQ0FBQTs0Q0FBQyxLQUFBLENBQUMsQ0FBQyxDQUFDLENBQVcsQ0FBQTs7Z0RBQ1osTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQVc7OzRDQUNoQixxQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFpQixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBQTs7NENBRnpELE1BQWlCLElBRWIsT0FBSSxHQUFFLFNBQStDO21EQUN4RCxDQUFDOzRDQUNGLHNCQUFPLENBQUMsRUFBQTs7O2lDQUNYLEVBQUUsRUFBUyxDQUFDLEVBQUE7O3dCQVRYLE9BQU8sR0FBRyxTQVNDO3dCQUVqQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO3dCQUdkLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBSyxJQUFLLE9BQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUssSUFBSyxPQUFBLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFyQixDQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7d0JBRW5JLEVBQUUsR0FBTyxJQUFJLENBQUE7d0JBQ2IsSUFBSSxHQUFHLGFBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGVBQVksQ0FBQTt3QkFDbEoscUJBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7NEJBQ2xDLDZCQUE2QjswQkFESzs7d0JBQWxDLEVBQUUsR0FBRyxTQUE2QixDQUFBO3dCQUNsQyw2QkFBNkI7d0JBRzdCLHNCQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFBOzs7O0tBQ3ZCO0lBQ0wsaUJBQUM7QUFBRCxDQUFDLEFBcEVELElBb0VDO0FBcEVZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2lwaGVyaXYsIGNyZWF0ZURlY2lwaGVyaXYgfSBmcm9tIFwiY3J5cHRvXCJcclxuaW1wb3J0IEpTWmlwLCB7IEpTWmlwT2JqZWN0IH0gZnJvbSBcImpzemlwXCJcclxuXHJcbmV4cG9ydCBjbGFzcyBDYXJkQ3J5cHRvIHtcclxuICAgIHN0YXRpYyBnZXRSZXRhaWxNYWMoa2V5c3RyOnN0cmluZywgZGF0YXN0cjpzdHJpbmcsIGl2c3RyOnN0cmluZykge1xyXG4gICAgICAgIC8vIGJpdCBwYWRcclxuICAgICAgICBsZXQgZGF0YXN0cnBhZGRlZCA9IGRhdGFzdHIgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIlxyXG4gICAgICAgIGRhdGFzdHJwYWRkZWQgPSBkYXRhc3RycGFkZGVkLnN1YnN0cmluZygwLCBkYXRhc3RycGFkZGVkLmxlbmd0aCAtIChkYXRhc3RycGFkZGVkLmxlbmd0aCAlIDE2KSlcclxuICAgICAgICBcclxuICAgICAgICBsZXQga2V5ID0gQnVmZmVyLmZyb20oa2V5c3RyLCBcImhleFwiKVxyXG4gICAgICAgIGxldCBkYXRhID0gQnVmZmVyLmZyb20oZGF0YXN0cnBhZGRlZCwgXCJoZXhcIilcclxuICAgICAgICBsZXQgaXYgPSBCdWZmZXIuZnJvbShpdnN0ciwgXCJoZXhcIilcclxuICAgIFxyXG4gICAgICAgIGxldCBrMSA9IGtleS5zbGljZSgwLCA4KVxyXG4gICAgICAgIGxldCBrMiA9IGtleS5zbGljZSg4LCAxNilcclxuICAgIFxyXG4gICAgICAgIGxldCBjMSA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGMgPSBjcmVhdGVDaXBoZXJpdihcImRlcy1jYmNcIiwgazEsIEJ1ZmZlci5hbGxvYyg4KSlcclxuICAgICAgICAgICAgYy5zZXRBdXRvUGFkZGluZyhmYWxzZSlcclxuICAgICAgICAgICAgcmV0dXJuIGNcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGMyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgYyA9IGNyZWF0ZURlY2lwaGVyaXYoXCJkZXMtY2JjXCIsIGsyLCBCdWZmZXIuYWxsb2MoOCkpXHJcbiAgICAgICAgICAgIGMuc2V0QXV0b1BhZGRpbmcoZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybiBjXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBiYyA9IGRhdGEubGVuZ3RoIC8gOFxyXG4gICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWF0aW9uMSA9IGMxKCkudXBkYXRlKGRhdGEuc2xpY2UoMCwgOCkpXHJcbiAgICAgICAgbGV0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYmM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYmxvY2sgPSBkYXRhLnNsaWNlKDggKiBpLCA4ICogKGkgKyAxKSlcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHRyYW5zZm9ybWF0aW9uMVtqXSBeIGJsb2NrW2pdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJhbnNmb3JtYXRpb24xID0gYzEoKS51cGRhdGUoYnVmZmVyKSAgICBcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBsZXQgdHJhbnNmb3JtYXRpb24zZCA9IGMyKCkudXBkYXRlKHRyYW5zZm9ybWF0aW9uMSlcclxuICAgICAgICBsZXQgdHJhbnNmb3JtYXRpb24zID0gYzEoKS51cGRhdGUodHJhbnNmb3JtYXRpb24zZClcclxuICAgIFxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvbjNcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgaW5zdGFsbEZvckxvYWQoY2FyZDphbnksIHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZW5hbWVzID0gW1wiSGVhZGVyXCIsIFwiRGlyZWN0b3J5XCIsIFwiSW1wb3J0XCIsIFwiQXBwbGV0XCIsIFwiQ2xhc3NcIiwgXCJNZXRob2RcIiwgXCJTdGF0aWNGaWVsZFwiLCBcIkV4cG9ydFwiLCBcIkNvbnN0YW50UG9vbFwiLCBcIlJlZkxvY2F0aW9uXCJdXHJcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IGF3YWl0IG1vZHVsZW5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG1vZCwgbykgPT4gW21vZCwgemRhdGEuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aChgJHttb2R9LmNhcGApKVswXSwgb10pXHJcbiAgICAgICAgICAgIC5maWx0ZXIoeCA9PiB4WzFdKVxyXG4gICAgICAgICAgICAucmVkdWNlKGFzeW5jIChwLCBjKSA9PiB7IFxyXG4gICAgICAgICAgICAgICAgcFtjWzJdIGFzIG51bWJlcl0gPSB7IFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogY1swXSBhcyBzdHJpbmcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGF3YWl0IChjWzFdIGFzIEpTWmlwT2JqZWN0KS5hc3luYyhcIm5vZGVidWZmZXJcIikgXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHAgXHJcbiAgICAgICAgICAgIH0sIFtdIGFzIGFueSlcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZyhtb2R1bGVzKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgYWlkID0gbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpLmRhdGEuc2xpY2UoMTMsIDEzICsgbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpLmRhdGFbMTJdKVxyXG5cclxuICAgICAgICBsZXQgc3c6YW55ID0gbnVsbFxyXG4gICAgICAgIGxldCBhcGR1ID0gYDgwZTYwMjAwJHsoYWlkLmxlbmd0aCArIDUgKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHsoYWlkLmxlbmd0aCArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0ke2FpZC50b1N0cmluZyhcImhleFwiKX0wMDAwMDAwMDAxYFxyXG4gICAgICAgIHN3ID0gYXdhaXQgY2FyZC5pc3N1ZUNvbW1hbmQoYXBkdSlcclxuICAgICAgICAvLyBUT0RPOiBjaGVjayBzdyA9PSAwMCA5MCAwMFxyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcclxuICAgIH1cclxufSJdfQ==