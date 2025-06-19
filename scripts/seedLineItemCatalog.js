"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
var path = require("path");
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Anon Key is missing. Make sure .env.local is set up correctly.');
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
var lineItems = [
    { code: 'BDC-addlhorizontals', description: 'Additional Horizontals', price: 20, duration_minutes: 4, category: 'Install' },
    { code: 'BDC-tripcharge', description: 'Trip Charge', price: 60, duration_minutes: 15, category: 'Service' },
    { code: 'BDC-installation', description: 'Installation', price: 60, duration_minutes: 15, category: 'Install' },
    { code: 'BDC-addlverticals', description: 'Additional Verticals', price: 35, duration_minutes: 12, category: 'Install' },
    { code: 'BDC-oversizevertical', description: 'Oversize Vertical', price: 6, duration_minutes: 0, category: 'Install' },
    { code: 'BDC-motorized', description: 'Motorized', price: 25, duration_minutes: 2, category: 'Install' },
    { code: 'BDC-windowRemoval', description: 'Window Removal', price: 6, duration_minutes: 0, category: 'Removal' },
    { code: 'BDC-installover10feet', description: 'Install Over 10 Feet', price: 15, duration_minutes: 1, category: 'Install' },
    { code: 'BDC-skylightinstall', description: 'Skylight Install', price: 27, duration_minutes: 2, category: 'Install' },
    { code: 'BDC-distance', description: 'Distance', price: 25, duration_minutes: 0, category: 'Service' },
    { code: 'BDC-Mileage', description: 'Mileage', price: 3, duration_minutes: 0, category: 'Service' },
    { code: 'BDC-Template', description: 'Template', price: 30, duration_minutes: 20, category: 'Service' },
    { code: 'BDC-Metal', description: 'Masonry/Metal/Tile', price: 12, duration_minutes: 0, category: 'Install' },
    { code: 'BDC-sheerverticalinstall', description: 'Sheer Vertical Install', price: 10, duration_minutes: 5, category: 'Install' },
    { code: 'BDC-commercial', description: 'Commercial', price: 0, duration_minutes: 5, category: 'Service' },
    { code: 'BDC-measurewindow', description: 'Measure Window', price: 0, duration_minutes: 1, category: 'Measurement' },
    { code: 'BDC-oversizedhorizontal', description: 'Oversized Horizontal', price: 0, duration_minutes: 1, category: 'Install' },
    { code: 'BDC-INSPECT', description: 'Inspect', price: 60, duration_minutes: 30, category: 'Service' },
    { code: 'BDC-windowtohaul', description: 'Window to Haul', price: 6, duration_minutes: 0, category: 'Removal' },
    { code: 'BDC-windowadjustment', description: 'Window Adjustment', price: 16, duration_minutes: 5, category: 'Service' },
    { code: 'BDC-minimum', description: 'Minimum Charge', price: 60, duration_minutes: 0, category: 'Service' },
    { code: 'BLIND/SHADE INSTALL-NAT', description: 'Blind/Shade Install (Nat)', price: 60, duration_minutes: 0, category: 'Install' },
    { code: 'BDC-measureladder', description: 'Measure with Ladder', price: 0, duration_minutes: 1, category: 'Measurement' },
    { code: 'BDC-REPAIR', description: 'Repair', price: 60, duration_minutes: 30, category: 'Service' },
    { code: 'BDC-measurement', description: 'Measurement', price: 35, duration_minutes: 10, category: 'Measurement' },
    { code: 'HORIZONTAL BLINDS', description: 'Horizontal Blinds', price: 20, duration_minutes: 4, category: 'Install' },
];
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, lineItems_1, item, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting to seed line_item_catalog...');
                    _i = 0, lineItems_1 = lineItems;
                    _a.label = 1;
                case 1:
                    if (!(_i < lineItems_1.length)) return [3 /*break*/, 4];
                    item = lineItems_1[_i];
                    return [4 /*yield*/, supabase
                            .from('line_item_catalog')
                            .upsert({
                            code: item.code,
                            description: item.description,
                            price: item.price,
                            duration_minutes: item.duration_minutes,
                            category: item.category,
                            active: true,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'code' })];
                case 2:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error upserting ".concat(item.code, ":"), error.message);
                    }
                    else {
                        console.log("Upserted: ".concat(item.code));
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Seeding complete.');
                    return [2 /*return*/];
            }
        });
    });
}
seed();
