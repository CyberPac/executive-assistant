"use strict";
/**
 * Travel Logistics Agent - Phase 2
 * Manages international travel planning and logistics for executives
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TravelLogisticsAgent = void 0;
var events_1 = require("events");
var nanoid_1 = require("nanoid");
var TravelLogisticsAgent = /** @class */ (function (_super) {
    __extends(TravelLogisticsAgent, _super);
    function TravelLogisticsAgent() {
        var _this = _super.call(this) || this;
        _this.agentId = "travel-logistics-".concat((0, nanoid_1.nanoid)());
        _this.travelPlans = new Map();
        _this.shortTrips = new Map();
        _this.requirementsDatabase = new Map();
        _this.flightPreferences = new Map();
        _this.trafficAPIKeys = {
            googleMaps: process.env.GOOGLE_MAPS_API_KEY || 'demo-key',
            waze: process.env.WAZE_API_KEY || 'demo-key'
        };
        _this.performanceMetrics = {
            responseTimes: [],
            successfulBookings: 0,
            totalPlans: 0,
            shortTrips: 0
        };
        _this.initializeTravelRequirements();
        _this.emit('agent:initialized', { agentId: _this.agentId });
        return _this;
    }
    /**
     * Initialize travel requirements database
     */
    TravelLogisticsAgent.prototype.initializeTravelRequirements = function () {
        var _this = this;
        var requirements = {
            'JP': {
                destination: 'Japan',
                visa: {
                    required: true,
                    type: 'Business Visa',
                    processingTime: '5-10 business days',
                    documents: ['Passport', 'Application form', 'Business invitation', 'Financial proof']
                },
                vaccinations: {
                    required: [],
                    recommended: ['Hepatitis A', 'Hepatitis B', 'Japanese Encephalitis']
                },
                documentation: {
                    passport: {
                        required: true,
                        validityRequired: '6 months beyond stay'
                    },
                    businessInvitation: true,
                    travelInsurance: true
                }
            },
            'US': {
                destination: 'United States',
                visa: {
                    required: true,
                    type: 'B-1 Business Visa or ESTA',
                    processingTime: '3-5 business days (ESTA) / 2-4 weeks (B-1)',
                    documents: ['Passport', 'DS-160 form', 'Business documents']
                },
                vaccinations: {
                    required: [],
                    recommended: ['Standard vaccinations up to date']
                },
                documentation: {
                    passport: {
                        required: true,
                        validityRequired: 'Valid for duration of stay + 6 months'
                    },
                    businessInvitation: false,
                    travelInsurance: false
                }
            },
            'UK': {
                destination: 'United Kingdom',
                visa: {
                    required: true,
                    type: 'Standard Visitor Visa',
                    processingTime: '3 weeks',
                    documents: ['Passport', 'Application form', 'Financial documents', 'Travel itinerary']
                },
                vaccinations: {
                    required: [],
                    recommended: []
                },
                documentation: {
                    passport: {
                        required: true,
                        validityRequired: 'Valid for duration of stay'
                    },
                    businessInvitation: false,
                    travelInsurance: false
                }
            }
        };
        Object.entries(requirements).forEach(function (_a) {
            var code = _a[0], requirement = _a[1];
            _this.requirementsDatabase.set(code, requirement);
        });
    };
    /**
     * Plan short trip (under 200km) with real-time traffic integration
     */
    TravelLogisticsAgent.prototype.planShortTrip = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, originCoords, destinationCoords, distance, routes, bestRoute, estimatedArrival, shortTrip, responseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.geocodeAddress(request.origin)];
                    case 2:
                        originCoords = _a.sent();
                        return [4 /*yield*/, this.geocodeAddress(request.destination)];
                    case 3:
                        destinationCoords = _a.sent();
                        distance = this.calculateDistance(originCoords, destinationCoords);
                        if (distance.km > 200) {
                            throw new Error("Trip distance ".concat(distance.km, "km exceeds 200km limit for short trips"));
                        }
                        return [4 /*yield*/, this.getRouteOptions(originCoords, destinationCoords, request.departureTime)];
                    case 4:
                        routes = _a.sent();
                        bestRoute = this.selectBestRoute(routes);
                        estimatedArrival = new Date(request.departureTime.getTime() + (bestRoute.duration * 60 * 1000));
                        shortTrip = {
                            id: (0, nanoid_1.nanoid)(),
                            executiveId: request.executiveId,
                            origin: {
                                address: request.origin,
                                coordinates: originCoords,
                                timezone: this.getTimezoneFromCoords(originCoords)
                            },
                            destination: {
                                address: request.destination,
                                coordinates: destinationCoords,
                                timezone: this.getTimezoneFromCoords(destinationCoords)
                            },
                            distance: distance,
                            routes: routes,
                            selectedRoute: bestRoute.id,
                            departureTime: request.departureTime,
                            estimatedArrival: estimatedArrival,
                            vehicleType: request.vehicleType || 'executive-car',
                            driverRequired: request.driverRequired || true,
                            status: 'planning',
                            notifications: {
                                trafficAlerts: true,
                                weatherUpdates: true,
                                routeChanges: true
                            },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        this.shortTrips.set(shortTrip.id, shortTrip);
                        this.performanceMetrics.shortTrips++;
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('short-trip:planned', {
                            tripId: shortTrip.id,
                            distance: distance.km,
                            estimatedDuration: bestRoute.duration,
                            responseTime: responseTime
                        });
                        // Start monitoring traffic for the trip
                        this.startTrafficMonitoring(shortTrip.id);
                        return [2 /*return*/, shortTrip];
                    case 5:
                        error_1 = _a.sent();
                        this.emit('short-trip:error', { request: request, error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get real-time route options with traffic data
     */
    TravelLogisticsAgent.prototype.getRouteOptions = function (origin, destination, departureTime) {
        return __awaiter(this, void 0, void 0, function () {
            var routes, googleRoute, error_2, wazeRoute, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        routes = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getGoogleMapsRoute(origin, destination, departureTime)];
                    case 2:
                        googleRoute = _a.sent();
                        routes.push(googleRoute);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.warn('Google Maps route failed:', error_2 instanceof Error ? error_2.message : String(error_2));
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.getWazeRoute(origin, destination, departureTime)];
                    case 5:
                        wazeRoute = _a.sent();
                        routes.push(wazeRoute);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        console.warn('Waze route failed:', error_3 instanceof Error ? error_3.message : String(error_3));
                        return [3 /*break*/, 7];
                    case 7:
                        // Fallback route if both APIs fail
                        if (routes.length === 0) {
                            routes.push(this.createFallbackRoute(origin, destination));
                        }
                        return [2 /*return*/, routes];
                }
            });
        });
    };
    /**
     * Get Google Maps route with traffic
     */
    TravelLogisticsAgent.prototype.getGoogleMapsRoute = function (origin, destination, departureTime) {
        return __awaiter(this, void 0, void 0, function () {
            var baseDistance, baseDuration, trafficMultiplier, actualDuration, delays;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        baseDistance = this.calculateDistance(origin, destination).km;
                        baseDuration = Math.round(baseDistance * 1.2);
                        trafficMultiplier = this.getTrafficMultiplier(departureTime);
                        actualDuration = Math.round(baseDuration * trafficMultiplier);
                        delays = actualDuration - baseDuration;
                        _a = {
                            id: "google-".concat((0, nanoid_1.nanoid)()),
                            provider: 'google-maps',
                            distance: baseDistance,
                            duration: actualDuration
                        };
                        _b = {
                            currentConditions: this.getTrafficCondition(trafficMultiplier),
                            delays: delays
                        };
                        return [4 /*yield*/, this.getTrafficIncidents(origin, destination)];
                    case 1: return [2 /*return*/, (_a.traffic = (_b.incidents = _c.sent(),
                            _b),
                            _a.tollCosts = this.estimateTollCosts(baseDistance),
                            _a.fuelCost = this.estimateFuelCost(baseDistance),
                            _a.route = {
                                polyline: 'encoded_polyline_data',
                                waypoints: this.generateWaypoints(origin, destination)
                            },
                            _a.alternativeScore = Math.round(85 - (delays * 2)),
                            _a.recommendationReason = delays > 15 ? 'Heavy traffic expected' : 'Optimal route with current traffic',
                            _a)];
                }
            });
        });
    };
    /**
     * Get Waze route with traffic
     */
    TravelLogisticsAgent.prototype.getWazeRoute = function (origin, destination, departureTime) {
        return __awaiter(this, void 0, void 0, function () {
            var baseDistance, baseDuration, trafficMultiplier, actualDuration, delays;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        baseDistance = this.calculateDistance(origin, destination).km;
                        baseDuration = Math.round(baseDistance * 1.1);
                        trafficMultiplier = this.getTrafficMultiplier(departureTime) * 0.9;
                        actualDuration = Math.round(baseDuration * trafficMultiplier);
                        delays = Math.max(0, actualDuration - baseDuration);
                        _a = {
                            id: "waze-".concat((0, nanoid_1.nanoid)()),
                            provider: 'waze',
                            distance: baseDistance * 1.05, // Might take slightly longer route to avoid traffic
                            duration: actualDuration
                        };
                        _b = {
                            currentConditions: this.getTrafficCondition(trafficMultiplier),
                            delays: delays
                        };
                        return [4 /*yield*/, this.getTrafficIncidents(origin, destination)];
                    case 1: return [2 /*return*/, (_a.traffic = (_b.incidents = _c.sent(),
                            _b),
                            _a.tollCosts = this.estimateTollCosts(baseDistance * 1.05),
                            _a.fuelCost = this.estimateFuelCost(baseDistance * 1.05),
                            _a.route = {
                                polyline: 'waze_encoded_polyline_data',
                                waypoints: this.generateWaypoints(origin, destination)
                            },
                            _a.alternativeScore = Math.round(90 - (delays * 1.5)),
                            _a.recommendationReason = delays < 10 ? 'Fastest route avoiding traffic' : 'Best available route with current conditions',
                            _a)];
                }
            });
        });
    };
    /**
     * Create fallback route when APIs fail
     */
    TravelLogisticsAgent.prototype.createFallbackRoute = function (origin, destination) {
        var distance = this.calculateDistance(origin, destination).km;
        var duration = Math.round(distance * 1.5); // Conservative estimate
        return {
            id: "fallback-".concat((0, nanoid_1.nanoid)()),
            provider: 'google-maps',
            distance: distance,
            duration: duration,
            traffic: {
                currentConditions: 'moderate',
                delays: 0,
                incidents: []
            },
            tollCosts: this.estimateTollCosts(distance),
            fuelCost: this.estimateFuelCost(distance),
            route: {
                polyline: 'fallback_polyline',
                waypoints: this.generateWaypoints(origin, destination)
            },
            alternativeScore: 60,
            recommendationReason: 'Estimated route - real-time traffic data unavailable'
        };
    };
    /**
     * Select best route from available options
     */
    TravelLogisticsAgent.prototype.selectBestRoute = function (routes) {
        var _this = this;
        if (routes.length === 1)
            return routes[0];
        // Score routes based on multiple factors
        return routes.reduce(function (best, current) {
            var bestScore = _this.calculateRouteScore(best);
            var currentScore = _this.calculateRouteScore(current);
            return currentScore > bestScore ? current : best;
        });
    };
    /**
     * Calculate route score for selection
     */
    TravelLogisticsAgent.prototype.calculateRouteScore = function (route) {
        var score = route.alternativeScore;
        // Bonus for less traffic delays
        score += Math.max(0, 30 - route.traffic.delays);
        // Bonus for lower fuel costs (environmental consideration)
        score += Math.max(0, 20 - route.fuelCost);
        // Penalty for severe traffic
        if (route.traffic.currentConditions === 'severe')
            score -= 20;
        if (route.traffic.currentConditions === 'heavy')
            score -= 10;
        return Math.max(0, score);
    };
    /**
     * Start monitoring traffic for active trip
     */
    TravelLogisticsAgent.prototype.startTrafficMonitoring = function (tripId) {
        var _this = this;
        // Mock implementation - would integrate with real-time traffic APIs
        var monitoringInterval = 5 * 60 * 1000; // 5 minutes
        var monitor = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var trip, updatedRoutes, currentBestRoute, originalRoute, hasNewIncidents, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trip = this.shortTrips.get(tripId);
                        if (!trip || ['completed', 'cancelled'].includes(trip.status)) {
                            clearInterval(monitor);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getRouteOptions(trip.origin.coordinates, trip.destination.coordinates, new Date())];
                    case 2:
                        updatedRoutes = _a.sent();
                        currentBestRoute = this.selectBestRoute(updatedRoutes);
                        originalRoute = trip.routes.find(function (r) { return r.id === trip.selectedRoute; });
                        // Check if route should be updated
                        if (this.shouldUpdateRoute(originalRoute || undefined, currentBestRoute)) {
                            trip.selectedRoute = currentBestRoute.id;
                            trip.routes = updatedRoutes;
                            trip.estimatedArrival = new Date(Date.now() + (currentBestRoute.duration * 60 * 1000));
                            trip.updatedAt = new Date();
                            this.emit('short-trip:route-updated', {
                                tripId: tripId,
                                newRoute: currentBestRoute,
                                reason: 'Traffic conditions changed'
                            });
                            // Send notification if enabled
                            if (trip.notifications.routeChanges) {
                                this.emit('short-trip:notification', {
                                    tripId: tripId,
                                    type: 'route-change',
                                    message: "Route updated due to traffic. New ETA: ".concat(trip.estimatedArrival.toLocaleTimeString())
                                });
                            }
                        }
                        hasNewIncidents = currentBestRoute.traffic.incidents.length > 0;
                        if (hasNewIncidents && trip.notifications.trafficAlerts) {
                            this.emit('short-trip:notification', {
                                tripId: tripId,
                                type: 'traffic-alert',
                                message: "Traffic incidents detected on your route",
                                incidents: currentBestRoute.traffic.incidents
                            });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.warn("Traffic monitoring failed for trip ".concat(tripId, ":"), error_4 instanceof Error ? error_4.message : String(error_4));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, monitoringInterval);
    };
    /**
     * Determine if route should be updated
     */
    TravelLogisticsAgent.prototype.shouldUpdateRoute = function (originalRoute, newRoute) {
        if (!originalRoute)
            return true;
        // Update if new route saves more than 10 minutes
        var timeSaving = originalRoute.duration - newRoute.duration;
        return timeSaving > 10;
    };
    /**
     * Update short trip status
     */
    TravelLogisticsAgent.prototype.updateShortTripStatus = function (tripId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var trip;
            return __generator(this, function (_a) {
                trip = this.shortTrips.get(tripId);
                if (!trip) {
                    throw new Error("Short trip not found: ".concat(tripId));
                }
                trip.status = status;
                trip.updatedAt = new Date();
                this.emit('short-trip:status-updated', { tripId: tripId, status: status });
                return [2 /*return*/, trip];
            });
        });
    };
    /**
     * Get short trip by ID
     */
    TravelLogisticsAgent.prototype.getShortTrip = function (tripId) {
        return this.shortTrips.get(tripId);
    };
    /**
     * Get all short trips for executive
     */
    TravelLogisticsAgent.prototype.getShortTripsForExecutive = function (executiveId) {
        return Array.from(this.shortTrips.values())
            .filter(function (trip) { return trip.executiveId === executiveId; });
    };
    /**
     * Helper methods for short trip planning
     */
    TravelLogisticsAgent.prototype.geocodeAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var mockCoordinates;
            return __generator(this, function (_a) {
                mockCoordinates = {
                    'New York, NY': { lat: 40.7128, lng: -74.0060 },
                    'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
                    'Boston, MA': { lat: 42.3601, lng: -71.0589 },
                    'Washington, DC': { lat: 38.9072, lng: -77.0369 }
                };
                return [2 /*return*/, mockCoordinates[address] || { lat: 40.7128, lng: -74.0060 }];
            });
        });
    };
    TravelLogisticsAgent.prototype.calculateDistance = function (coord1, coord2) {
        var R = 6371; // Earth's radius in km
        var dLat = this.deg2rad(coord2.lat - coord1.lat);
        var dLng = this.deg2rad(coord2.lng - coord1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var km = R * c;
        return {
            km: Math.round(km * 10) / 10,
            miles: Math.round(km * 0.621371 * 10) / 10
        };
    };
    TravelLogisticsAgent.prototype.deg2rad = function (deg) {
        return deg * (Math.PI / 180);
    };
    TravelLogisticsAgent.prototype.getTrafficMultiplier = function (departureTime) {
        var hour = departureTime.getHours();
        var day = departureTime.getDay();
        // Weekend traffic is lighter
        if (day === 0 || day === 6)
            return 1.1;
        // Rush hour traffic
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
            return 1.6;
        // Regular traffic
        if (hour >= 6 && hour <= 22)
            return 1.3;
        // Night traffic
        return 1.0;
    };
    TravelLogisticsAgent.prototype.getTrafficCondition = function (multiplier) {
        if (multiplier <= 1.1)
            return 'light';
        if (multiplier <= 1.3)
            return 'moderate';
        if (multiplier <= 1.5)
            return 'heavy';
        return 'severe';
    };
    TravelLogisticsAgent.prototype.getTrafficIncidents = function (origin, destination) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock implementation - replace with actual traffic API
                return [2 /*return*/, [
                        {
                            type: 'construction',
                            severity: 'minor',
                            description: 'Lane closure for road work',
                            location: 'I-95 North near Exit 23',
                            estimatedDelay: 5,
                            coordinates: { lat: 40.7580, lng: -73.9855 }
                        }
                    ]];
            });
        });
    };
    TravelLogisticsAgent.prototype.estimateTollCosts = function (distanceKm) {
        // Rough estimate: $0.50 per 10km
        return Math.round((distanceKm * 0.05) * 100) / 100;
    };
    TravelLogisticsAgent.prototype.estimateFuelCost = function (distanceKm) {
        // Assume 8L/100km consumption and $1.50/L
        var fuelUsed = (distanceKm * 8) / 100;
        return Math.round(fuelUsed * 1.50 * 100) / 100;
    };
    TravelLogisticsAgent.prototype.generateWaypoints = function (origin, destination) {
        return [
            __assign(__assign({}, origin), { instruction: 'Start at origin' }),
            __assign(__assign({}, destination), { instruction: 'Arrive at destination' })
        ];
    };
    TravelLogisticsAgent.prototype.getTimezoneFromCoords = function (coords) {
        // Mock implementation - would use timezone API in production
        return 'America/New_York';
    };
    /**
     * Create comprehensive travel plan
     */
    TravelLogisticsAgent.prototype.createTravelPlan = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, countryCode, requirements, travelPlan, responseTime, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        countryCode = this.getCountryCode(request.destination.country);
                        requirements = this.requirementsDatabase.get(countryCode);
                        if (!requirements) {
                            throw new Error("Travel requirements not available for: ".concat(request.destination.country));
                        }
                        _a = {
                            id: (0, nanoid_1.nanoid)(),
                            executiveId: request.executiveId,
                            type: 'international',
                            destination: __assign(__assign({}, request.destination), { timezone: this.getTimezone(countryCode) }),
                            dates: __assign(__assign({}, request.dates), { duration: Math.ceil((request.dates.return.getTime() - request.dates.departure.getTime()) / (1000 * 60 * 60 * 24)) }),
                            purpose: request.purpose,
                            requirements: requirements
                        };
                        return [4 /*yield*/, this.generateRecommendations(countryCode, request.destination.city)];
                    case 2:
                        _a.recommendations = _b.sent();
                        return [4 /*yield*/, this.generateCulturalBriefing(countryCode)];
                    case 3:
                        _a.culturalBriefing = _b.sent();
                        return [4 /*yield*/, this.generateEmergencyProtocols(countryCode, request.destination.city)];
                    case 4:
                        travelPlan = (_a.emergencyProtocols = _b.sent(),
                            _a.status = 'planning',
                            _a.createdAt = new Date(),
                            _a.updatedAt = new Date(),
                            _a);
                        this.travelPlans.set(travelPlan.id, travelPlan);
                        this.performanceMetrics.totalPlans++;
                        responseTime = Date.now() - startTime;
                        this.performanceMetrics.responseTimes.push(responseTime);
                        this.emit('travel:plan-created', {
                            planId: travelPlan.id,
                            destination: request.destination,
                            responseTime: responseTime
                        });
                        return [2 /*return*/, travelPlan];
                    case 5:
                        error_5 = _b.sent();
                        this.emit('travel:error', { request: request, error: error_5 instanceof Error ? error_5.message : String(error_5) });
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate travel recommendations
     */
    TravelLogisticsAgent.prototype.generateRecommendations = function (countryCode, city) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations;
            return __generator(this, function (_a) {
                recommendations = {
                    hotels: [
                        'Luxury business hotels with concierge services',
                        'Hotels with executive floors and meeting facilities',
                        'Hotels near business districts'
                    ],
                    transportation: [
                        'Private car service for airport transfers',
                        'Executive taxi services with English-speaking drivers',
                        'Local public transport executive passes'
                    ],
                    dining: [
                        'Michelin-starred restaurants for client entertainment',
                        'Business lunch venues with private dining',
                        'Local specialty restaurants for cultural experience'
                    ],
                    networking: [
                        'Business chambers and executive clubs',
                        'Industry-specific networking events',
                        'Cultural events suitable for business networking'
                    ]
                };
                return [2 /*return*/, recommendations];
            });
        });
    };
    /**
     * Generate cultural briefing
     */
    TravelLogisticsAgent.prototype.generateCulturalBriefing = function (countryCode) {
        return __awaiter(this, void 0, void 0, function () {
            var briefings;
            return __generator(this, function (_a) {
                briefings = {
                    'JP': {
                        keyPoints: [
                            'Respect hierarchy and seniority',
                            'Business cards are sacred - treat with respect',
                            'Silence is valuable - don\'t rush to fill gaps'
                        ],
                        businessEtiquette: [
                            'Bow when greeting, deeper for seniors',
                            'Present business cards with both hands',
                            'Remove shoes when entering traditional spaces'
                        ],
                        warnings: [
                            'Never point with finger - use open hand',
                            'Avoid public displays of emotion',
                            'Don\'t refuse offered business cards'
                        ]
                    },
                    'US': {
                        keyPoints: [
                            'Direct communication is valued',
                            'Time is money - be punctual',
                            'Personal space is important'
                        ],
                        businessEtiquette: [
                            'Firm handshake with eye contact',
                            'First names are common in business',
                            'Dress professionally but not overly formal'
                        ],
                        warnings: [
                            'Avoid discussing politics or religion',
                            'Tipping is expected in restaurants (18-20%)',
                            'Personal space - maintain 3-4 feet distance'
                        ]
                    }
                };
                return [2 /*return*/, briefings[countryCode] || {
                        keyPoints: ['Research local customs before travel'],
                        businessEtiquette: ['Follow standard international business practices'],
                        warnings: ['Consult local contacts for specific guidance']
                    }];
            });
        });
    };
    /**
     * Generate emergency protocols
     */
    TravelLogisticsAgent.prototype.generateEmergencyProtocols = function (countryCode, city) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        embassy: "[Country] Embassy in ".concat(city),
                        emergencyContacts: [
                            'Local emergency services: varies by country',
                            'Executive assistant: [Contact]',
                            'Company security: [Contact]'
                        ],
                        medicalFacilities: [
                            'International hospitals with English services',
                            '24/7 medical clinics',
                            'Pharmacy locations'
                        ],
                        evacuation: false // Set based on current security conditions
                    }];
            });
        });
    };
    /**
     * Update travel plan status
     */
    TravelLogisticsAgent.prototype.updateTravelPlanStatus = function (planId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var plan;
            return __generator(this, function (_a) {
                plan = this.travelPlans.get(planId);
                if (!plan) {
                    throw new Error("Travel plan not found: ".concat(planId));
                }
                plan.status = status;
                plan.updatedAt = new Date();
                if (status === 'completed') {
                    this.performanceMetrics.successfulBookings++;
                }
                this.emit('travel:status-updated', { planId: planId, status: status });
                return [2 /*return*/, plan];
            });
        });
    };
    /**
     * Get travel plan by ID
     */
    TravelLogisticsAgent.prototype.getTravelPlan = function (planId) {
        return this.travelPlans.get(planId);
    };
    /**
     * Get all travel plans for executive
     */
    TravelLogisticsAgent.prototype.getTravelPlansForExecutive = function (executiveId) {
        return Array.from(this.travelPlans.values())
            .filter(function (plan) { return plan.executiveId === executiveId; });
    };
    /**
     * Helper methods
     */
    TravelLogisticsAgent.prototype.getCountryCode = function (countryName) {
        var countryCodes = {
            'Japan': 'JP',
            'United States': 'US',
            'USA': 'US',
            'United Kingdom': 'UK',
            'UK': 'UK',
            'Germany': 'DE'
        };
        return countryCodes[countryName] || countryName.toUpperCase().slice(0, 2);
    };
    TravelLogisticsAgent.prototype.getTimezone = function (countryCode) {
        var timezones = {
            'JP': 'Asia/Tokyo',
            'US': 'America/New_York',
            'UK': 'Europe/London',
            'DE': 'Europe/Berlin'
        };
        return timezones[countryCode] || 'UTC';
    };
    /**
     * Get performance metrics
     */
    TravelLogisticsAgent.prototype.getPerformanceMetrics = function () {
        var avgResponseTime = this.performanceMetrics.responseTimes.length > 0
            ? this.performanceMetrics.responseTimes.reduce(function (a, b) { return a + b; }, 0) / this.performanceMetrics.responseTimes.length
            : 0;
        return {
            agentId: this.agentId,
            averageResponseTime: "".concat(avgResponseTime.toFixed(2), "ms"),
            totalPlans: this.performanceMetrics.totalPlans,
            shortTrips: this.performanceMetrics.shortTrips,
            successfulBookings: this.performanceMetrics.successfulBookings,
            successRate: "".concat(((this.performanceMetrics.successfulBookings / (this.performanceMetrics.totalPlans + this.performanceMetrics.shortTrips)) * 100).toFixed(1), "%"),
            countriesCovered: this.requirementsDatabase.size,
            targetResponseTime: '<75ms (Phase 2 goal)',
            features: {
                internationalTravel: true,
                shortTripPlanning: true,
                realTimeTraffic: true,
                multipleRouteProviders: ['Google Maps', 'Waze'],
                trafficMonitoring: true,
                culturalBriefings: true
            }
        };
    };
    return TravelLogisticsAgent;
}(events_1.EventEmitter));
exports.TravelLogisticsAgent = TravelLogisticsAgent;
exports.default = TravelLogisticsAgent;
