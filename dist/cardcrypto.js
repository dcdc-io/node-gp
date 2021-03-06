"use strict";
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
        var pad = function (buffer, len) { return Buffer.alloc(len).fill(buffer); };
        var transformation3d = c2().update(pad(transformation1, 16));
        var transformation3 = c1().update(pad(transformation3d, 8));
        return transformation3;
    };
    return CardCrypto;
}());
exports.CardCrypto = CardCrypto;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZENyeXB0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9DYXJkQ3J5cHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXlEO0FBRXpEO0lBQUE7SUF1REEsQ0FBQztJQXRERzs7OztPQUlHO0lBQ0ksdUJBQVksR0FBbkIsVUFBb0IsSUFBUSxFQUFFLEdBQU87UUFDakMsSUFBTSxNQUFNLEdBQUcsdUJBQWMsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRSxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzVCLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDN0IsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3hCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBQ00sdUJBQVksR0FBbkIsVUFBb0IsTUFBYSxFQUFFLE9BQWMsRUFBRSxLQUFZO1FBQzNELFVBQVU7UUFDVixJQUFJLGFBQWEsR0FBRyxPQUFPLEdBQUcsa0JBQWtCLENBQUE7UUFDaEQsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFOUYsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDcEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDNUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFbEMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFekIsSUFBSSxFQUFFLEdBQUc7WUFDTCxJQUFJLENBQUMsR0FBRyx1QkFBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RELENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsT0FBTyxDQUFDLENBQUE7UUFDWixDQUFDLENBQUE7UUFDRCxJQUFJLEVBQUUsR0FBRztZQUNMLElBQUksQ0FBQyxHQUFHLHlCQUFnQixDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3hELENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsT0FBTyxDQUFDLENBQUE7UUFDWixDQUFDLENBQUE7UUFFRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtRQUV4QixJQUFJLGVBQWUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzVDO1lBQ0QsZUFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN4QztRQUNELElBQU0sR0FBRyxHQUFHLFVBQUMsTUFBYSxFQUFFLEdBQVUsSUFBSyxPQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUE5QixDQUE4QixDQUFBO1FBRXpFLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM1RCxJQUFJLGVBQWUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0QsT0FBTyxlQUFlLENBQUE7SUFDMUIsQ0FBQztJQUVMLGlCQUFDO0FBQUQsQ0FBQyxBQXZERCxJQXVEQztBQXZEWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNpcGhlcml2LCBjcmVhdGVEZWNpcGhlcml2IH0gZnJvbSBcImNyeXB0b1wiXHJcblxyXG5leHBvcnQgY2xhc3MgQ2FyZENyeXB0byB7XHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYSBERVMgc2Vzc2lvbiBrZXkgYXMgcGVyIEdQIENhcmQgU3BlYyAyLjEuMSBFLjQuMS5cclxuICAgICAqIEBwYXJhbSBkYXRhIHRoZSBpbnB1dCBkYXRhXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBjaXBoZXIga2V5XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB0cmlwbGVEZXNDYmMoZGF0YTphbnksIGtleTphbnkpIHsgICAgICAgIFxyXG4gICAgICAgIGNvbnN0IGNpcGhlciA9IGNyZWF0ZUNpcGhlcml2KCdkZXMtZWRlLWNiYycsIGtleSwgQnVmZmVyLmFsbG9jKDgpKVxyXG4gICAgICAgIGNpcGhlci5zZXRBdXRvUGFkZGluZyhmYWxzZSlcclxuICAgICAgICBjb25zdCBiID0gY2lwaGVyLnVwZGF0ZShkYXRhKVxyXG4gICAgICAgIGNvbnN0IGYgPSBjaXBoZXIuZmluYWwoKVxyXG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtiLCBmXSwgYi5sZW5ndGggKyBmLmxlbmd0aClcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRSZXRhaWxNYWMoa2V5c3RyOnN0cmluZywgZGF0YXN0cjpzdHJpbmcsIGl2c3RyOnN0cmluZykge1xyXG4gICAgICAgIC8vIGJpdCBwYWRcclxuICAgICAgICBsZXQgZGF0YXN0cnBhZGRlZCA9IGRhdGFzdHIgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIlxyXG4gICAgICAgIGRhdGFzdHJwYWRkZWQgPSBkYXRhc3RycGFkZGVkLnN1YnN0cmluZygwLCBkYXRhc3RycGFkZGVkLmxlbmd0aCAtIChkYXRhc3RycGFkZGVkLmxlbmd0aCAlIDE2KSlcclxuICAgICAgICBcclxuICAgICAgICBsZXQga2V5ID0gQnVmZmVyLmZyb20oa2V5c3RyLCBcImhleFwiKVxyXG4gICAgICAgIGxldCBkYXRhID0gQnVmZmVyLmZyb20oZGF0YXN0cnBhZGRlZCwgXCJoZXhcIilcclxuICAgICAgICBsZXQgaXYgPSBCdWZmZXIuZnJvbShpdnN0ciwgXCJoZXhcIilcclxuICAgIFxyXG4gICAgICAgIGxldCBrMSA9IGtleS5zbGljZSgwLCA4KVxyXG4gICAgICAgIGxldCBrMiA9IGtleS5zbGljZSg4LCAxNilcclxuICAgIFxyXG4gICAgICAgIGxldCBjMSA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGMgPSBjcmVhdGVDaXBoZXJpdihcImRlcy1jYmNcIiwgazEsIEJ1ZmZlci5hbGxvYyg4KSlcclxuICAgICAgICAgICAgYy5zZXRBdXRvUGFkZGluZyhmYWxzZSlcclxuICAgICAgICAgICAgcmV0dXJuIGNcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGMyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgYyA9IGNyZWF0ZURlY2lwaGVyaXYoXCJkZXMtY2JjXCIsIGsyLCBCdWZmZXIuYWxsb2MoOCkpXHJcbiAgICAgICAgICAgIGMuc2V0QXV0b1BhZGRpbmcoZmFsc2UpXHJcbiAgICAgICAgICAgIHJldHVybiBjXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBiYyA9IGRhdGEubGVuZ3RoIC8gOFxyXG4gICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWF0aW9uMSA9IGMxKCkudXBkYXRlKGRhdGEuc2xpY2UoMCwgOCkpXHJcbiAgICAgICAgbGV0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYmM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYmxvY2sgPSBkYXRhLnNsaWNlKDggKiBpLCA4ICogKGkgKyAxKSlcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGJ1ZmZlcltqXSA9IHRyYW5zZm9ybWF0aW9uMVtqXSBeIGJsb2NrW2pdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJhbnNmb3JtYXRpb24xID0gYzEoKS51cGRhdGUoYnVmZmVyKSAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFkID0gKGJ1ZmZlcjpCdWZmZXIsIGxlbjpudW1iZXIpID0+IEJ1ZmZlci5hbGxvYyhsZW4pLmZpbGwoYnVmZmVyKVxyXG4gICAgXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWF0aW9uM2QgPSBjMigpLnVwZGF0ZShwYWQodHJhbnNmb3JtYXRpb24xLCAxNikpXHJcbiAgICAgICAgbGV0IHRyYW5zZm9ybWF0aW9uMyA9IGMxKCkudXBkYXRlKHBhZCh0cmFuc2Zvcm1hdGlvbjNkLCA4KSlcclxuICAgIFxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvbjNcclxuICAgIH1cclxuXHJcbn0iXX0=