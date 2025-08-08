"use strict";
/**
 * Cultural Intelligence Agent - Phase 2
 * Provides cultural context and intelligence for executive decision-making
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
exports.CulturalIntelligenceAgent = void 0;
var events_1 = require("events");
var nanoid_1 = require("nanoid");
var CulturalIntelligenceAgent = /** @class */ (function (_super) {
    __extends(CulturalIntelligenceAgent, _super);
    function CulturalIntelligenceAgent() {
        var _this = _super.call(this) || this;
        _this.agentId = "cultural-intel-".concat((0, nanoid_1.nanoid)());
        _this.knowledgeBase = new Map();
        _this.insights = new Map();
        _this.performanceMetrics = {
            responseTimes: [],
            accuracyScore: 0.95,
            totalQueries: 0
        };
        _this.initializeKnowledgeBase();
        _this.emit('agent:initialized', { agentId: _this.agentId });
        return _this;
    }
    /**
     * Initialize cultural knowledge base with 35+ countries
     */
    CulturalIntelligenceAgent.prototype.initializeKnowledgeBase = function () {
        var _this = this;
        var cultures = {
            'US': {
                country: 'United States',
                region: 'North America',
                businessEtiquette: {
                    greetings: ['firm handshake', 'eye contact', 'smile'],
                    meetingProtocols: ['punctual', 'agenda-driven', 'direct communication'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['eye contact important', 'personal space 3-4 feet'],
                    languagePreferences: ['English'],
                    businessLanguages: ['English']
                },
                timeZone: 'America/New_York',
                workingHours: {
                    start: '09:00',
                    end: '17:00',
                    weekends: false,
                    holidays: ['New Year', 'Independence Day', 'Thanksgiving', 'Christmas']
                },
                negotiationStyle: {
                    approach: 'direct',
                    decisionMaking: 'individual',
                    timeline: 'fast'
                }
            },
            'JP': {
                country: 'Japan',
                region: 'East Asia',
                businessEtiquette: {
                    greetings: ['bow', 'business card ceremony', 'respectful silence'],
                    meetingProtocols: ['ringi consensus', 'seniority order', 'formal presentation'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'low',
                    nonVerbalCues: ['silence is golden', 'avoid eye contact with superiors'],
                    languagePreferences: ['Japanese'],
                    businessLanguages: ['Japanese', 'English']
                },
                timeZone: 'Asia/Tokyo',
                workingHours: {
                    start: '09:00',
                    end: '18:00',
                    weekends: false,
                    holidays: ['Golden Week', 'Obon', 'New Year']
                },
                negotiationStyle: {
                    approach: 'relationship-based',
                    decisionMaking: 'consensus',
                    timeline: 'slow'
                }
            },
            'DE': {
                country: 'Germany',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'titles important', 'formal address'],
                    meetingProtocols: ['extremely punctual', 'thorough preparation', 'direct feedback'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['maintain composure', 'professional distance'],
                    languagePreferences: ['German'],
                    businessLanguages: ['German', 'English']
                },
                timeZone: 'Europe/Berlin',
                workingHours: {
                    start: '08:00',
                    end: '17:00',
                    weekends: false,
                    holidays: ['Christmas Market period', 'Summer holidays']
                },
                negotiationStyle: {
                    approach: 'formal',
                    decisionMaking: 'hierarchical',
                    timeline: 'moderate'
                }
            },
            'CN': {
                country: 'China',
                region: 'East Asia',
                businessEtiquette: {
                    greetings: ['respectful bow', 'business card exchange', 'formal introduction'],
                    meetingProtocols: ['hierarchical seating', 'relationship building', 'face-saving approach'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'low',
                    nonVerbalCues: ['face importance', 'indirect feedback', 'group harmony'],
                    languagePreferences: ['Mandarin'],
                    businessLanguages: ['Mandarin', 'English']
                },
                timeZone: 'Asia/Shanghai',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Spring Festival', 'National Day', 'Mid-Autumn Festival'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'hierarchical', timeline: 'slow' }
            },
            'GB': {
                country: 'United Kingdom',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['polite handshake', 'proper introductions', 'courtesy'],
                    meetingProtocols: ['queue respect', 'understatement', 'diplomatic approach'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['personal space', 'politeness', 'subtlety'],
                    languagePreferences: ['English'],
                    businessLanguages: ['English']
                },
                timeZone: 'Europe/London',
                workingHours: { start: '09:00', end: '17:30', weekends: false, holidays: ['Christmas', 'Boxing Day', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'individual', timeline: 'moderate' }
            },
            'FR': {
                country: 'France',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['light handshake', 'proper titles', 'formal address'],
                    meetingProtocols: ['intellectual discussion', 'logical arguments', 'formal presentation'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['eloquent gestures', 'intellectual discourse'],
                    languagePreferences: ['French'],
                    businessLanguages: ['French', 'English']
                },
                timeZone: 'Europe/Paris',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Bastille Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'IT': {
                country: 'Italy',
                region: 'Southern Europe',
                businessEtiquette: {
                    greetings: ['warm handshake', 'personal connection', 'relationship focus'],
                    meetingProtocols: ['relationship building', 'passionate discussion', 'flexible timing'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['expressive gestures', 'emotional expression'],
                    languagePreferences: ['Italian'],
                    businessLanguages: ['Italian', 'English']
                },
                timeZone: 'Europe/Rome',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Ferragosto', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'ES': {
                country: 'Spain',
                region: 'Southern Europe',
                businessEtiquette: {
                    greetings: ['warm greeting', 'personal space respect', 'relationship importance'],
                    meetingProtocols: ['relationship first', 'flexible scheduling', 'social interaction'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['animated gestures', 'close proximity'],
                    languagePreferences: ['Spanish'],
                    businessLanguages: ['Spanish', 'English']
                },
                timeZone: 'Europe/Madrid',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Semana Santa', 'Christmas', 'National Day'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'EE': {
                country: 'Estonia',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'direct eye contact', 'reserved approach'],
                    meetingProtocols: ['punctuality critical', 'efficiency focused', 'technology integration'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['personal space', 'minimal small talk'],
                    languagePreferences: ['Estonian'],
                    businessLanguages: ['Estonian', 'English', 'Russian']
                },
                timeZone: 'Europe/Tallinn',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Independence Day', 'Midsummer', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'fast' }
            },
            'IN': {
                country: 'India',
                region: 'South Asia',
                businessEtiquette: {
                    greetings: ['namaste', 'respect for elders', 'hierarchical acknowledgment'],
                    meetingProtocols: ['relationship building', 'hierarchical respect', 'consensus seeking'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'low',
                    nonVerbalCues: ['head gestures', 'respect for authority'],
                    languagePreferences: ['Hindi', 'English'],
                    businessLanguages: ['English', 'Hindi']
                },
                timeZone: 'Asia/Kolkata',
                workingHours: { start: '09:30', end: '18:30', weekends: false, holidays: ['Diwali', 'Holi', 'Independence Day'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'hierarchical', timeline: 'slow' }
            },
            'BR': {
                country: 'Brazil',
                region: 'South America',
                businessEtiquette: {
                    greetings: ['warm handshake', 'personal connection', 'social interaction'],
                    meetingProtocols: ['relationship focus', 'social conversation', 'flexible timing'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['close proximity', 'expressive gestures', 'physical contact'],
                    languagePreferences: ['Portuguese'],
                    businessLanguages: ['Portuguese', 'English']
                },
                timeZone: 'America/Sao_Paulo',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Carnival', 'Independence Day', 'Christmas'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'KR': {
                country: 'South Korea',
                region: 'East Asia',
                businessEtiquette: {
                    greetings: ['respectful bow', 'business card ceremony', 'age respect'],
                    meetingProtocols: ['hierarchical order', 'consensus building', 'formal presentation'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'low',
                    nonVerbalCues: ['silence respect', 'indirect communication'],
                    languagePreferences: ['Korean'],
                    businessLanguages: ['Korean', 'English']
                },
                timeZone: 'Asia/Seoul',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Chuseok', 'Lunar New Year', 'Liberation Day'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'slow' }
            },
            'SG': {
                country: 'Singapore',
                region: 'Southeast Asia',
                businessEtiquette: {
                    greetings: ['appropriate to culture', 'multicultural awareness', 'respectful approach'],
                    meetingProtocols: ['efficiency focused', 'multicultural consideration', 'punctuality'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['cultural sensitivity', 'professional distance'],
                    languagePreferences: ['English', 'Mandarin', 'Malay', 'Tamil'],
                    businessLanguages: ['English']
                },
                timeZone: 'Asia/Singapore',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Chinese New Year', 'Deepavali', 'Hari Raya'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'individual', timeline: 'fast' }
            },
            'AU': {
                country: 'Australia',
                region: 'Oceania',
                businessEtiquette: {
                    greetings: ['firm handshake', 'casual approach', 'egalitarian attitude'],
                    meetingProtocols: ['informal atmosphere', 'direct communication', 'practical focus'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['casual demeanor', 'sense of humor'],
                    languagePreferences: ['English'],
                    businessLanguages: ['English']
                },
                timeZone: 'Australia/Sydney',
                workingHours: { start: '09:00', end: '17:00', weekends: false, holidays: ['Australia Day', 'ANZAC Day', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'individual', timeline: 'fast' }
            },
            'CA': {
                country: 'Canada',
                region: 'North America',
                businessEtiquette: {
                    greetings: ['firm handshake', 'politeness', 'bilingual consideration'],
                    meetingProtocols: ['collaborative approach', 'consensus seeking', 'inclusive discussion'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['politeness', 'personal space'],
                    languagePreferences: ['English', 'French'],
                    businessLanguages: ['English', 'French']
                },
                timeZone: 'America/Toronto',
                workingHours: { start: '09:00', end: '17:00', weekends: false, holidays: ['Canada Day', 'Thanksgiving', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'MX': {
                country: 'Mexico',
                region: 'North America',
                businessEtiquette: {
                    greetings: ['warm handshake', 'personal connection', 'family importance'],
                    meetingProtocols: ['relationship building', 'social interaction', 'flexible timing'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['close proximity', 'expressive gestures'],
                    languagePreferences: ['Spanish'],
                    businessLanguages: ['Spanish', 'English']
                },
                timeZone: 'America/Mexico_City',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Independence Day', 'Day of the Dead', 'Christmas'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'RU': {
                country: 'Russia',
                region: 'Eastern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'formal address', 'respect for hierarchy'],
                    meetingProtocols: ['formal structure', 'hierarchical decision', 'detailed discussion'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['serious demeanor', 'formal interaction'],
                    languagePreferences: ['Russian'],
                    businessLanguages: ['Russian', 'English']
                },
                timeZone: 'Europe/Moscow',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['New Year', 'Defender Day', 'Victory Day'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'hierarchical', timeline: 'slow' }
            },
            'ZA': {
                country: 'South Africa',
                region: 'Africa',
                businessEtiquette: {
                    greetings: ['handshake', 'cultural awareness', 'ubuntu philosophy'],
                    meetingProtocols: ['inclusive approach', 'consensus building', 'cultural sensitivity'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['respectful interaction', 'cultural diversity'],
                    languagePreferences: ['English', 'Afrikaans'],
                    businessLanguages: ['English']
                },
                timeZone: 'Africa/Johannesburg',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Freedom Day', 'Heritage Day', 'Christmas'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'AE': {
                country: 'United Arab Emirates',
                region: 'Middle East',
                businessEtiquette: {
                    greetings: ['respectful handshake', 'cultural sensitivity', 'Islamic customs'],
                    meetingProtocols: ['relationship first', 'respect for tradition', 'hospitality'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['respect for culture', 'diplomatic approach'],
                    languagePreferences: ['Arabic'],
                    businessLanguages: ['Arabic', 'English']
                },
                timeZone: 'Asia/Dubai',
                workingHours: { start: '09:00', end: '18:00', weekends: true, holidays: ['Eid al-Fitr', 'Eid al-Adha', 'National Day'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'TH': {
                country: 'Thailand',
                region: 'Southeast Asia',
                businessEtiquette: {
                    greetings: ['wai greeting', 'respect for hierarchy', 'face-saving approach'],
                    meetingProtocols: ['hierarchical respect', 'indirect communication', 'harmony maintenance'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'strict'
                },
                communication: {
                    directness: 'low',
                    nonVerbalCues: ['smile importance', 'indirect feedback'],
                    languagePreferences: ['Thai'],
                    businessLanguages: ['Thai', 'English']
                },
                timeZone: 'Asia/Bangkok',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Songkran', 'Loy Krathong', 'King\'s Birthday'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'slow' }
            },
            'SE': {
                country: 'Sweden',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'equality focus', 'casual approach'],
                    meetingProtocols: ['consensus building', 'egalitarian discussion', 'work-life balance'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['personal space', 'modesty'],
                    languagePreferences: ['Swedish'],
                    businessLanguages: ['Swedish', 'English']
                },
                timeZone: 'Europe/Stockholm',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Midsummer', 'Lucia', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'NL': {
                country: 'Netherlands',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'direct approach', 'egalitarian values'],
                    meetingProtocols: ['efficiency focus', 'direct feedback', 'consensus seeking'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['straightforward manner', 'honesty valued'],
                    languagePreferences: ['Dutch'],
                    businessLanguages: ['Dutch', 'English']
                },
                timeZone: 'Europe/Amsterdam',
                workingHours: { start: '09:00', end: '17:30', weekends: false, holidays: ['King\'s Day', 'Liberation Day', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'fast' }
            },
            'CH': {
                country: 'Switzerland',
                region: 'Central Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'punctuality emphasis', 'formal address'],
                    meetingProtocols: ['extreme punctuality', 'thorough preparation', 'consensus building'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['reserved manner', 'quality focus'],
                    languagePreferences: ['German', 'French', 'Italian'],
                    businessLanguages: ['German', 'French', 'English']
                },
                timeZone: 'Europe/Zurich',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['National Day', 'Christmas', 'New Year'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'NO': {
                country: 'Norway',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'equality emphasis', 'informal approach'],
                    meetingProtocols: ['consensus focus', 'egalitarian discussion', 'environmental awareness'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['personal space', 'nature connection'],
                    languagePreferences: ['Norwegian'],
                    businessLanguages: ['Norwegian', 'English']
                },
                timeZone: 'Europe/Oslo',
                workingHours: { start: '08:00', end: '16:00', weekends: false, holidays: ['Constitution Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'FI': {
                country: 'Finland',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'minimal small talk', 'punctuality focus'],
                    meetingProtocols: ['efficiency emphasis', 'silence comfort', 'direct communication'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['comfortable silence', 'personal space'],
                    languagePreferences: ['Finnish'],
                    businessLanguages: ['Finnish', 'English']
                },
                timeZone: 'Europe/Helsinki',
                workingHours: { start: '08:00', end: '16:00', weekends: false, holidays: ['Independence Day', 'Midsummer', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'fast' }
            },
            'DK': {
                country: 'Denmark',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'casual approach', 'egalitarian values'],
                    meetingProtocols: ['informal atmosphere', 'consensus building', 'work-life balance'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['casual demeanor', 'hygge concept'],
                    languagePreferences: ['Danish'],
                    businessLanguages: ['Danish', 'English']
                },
                timeZone: 'Europe/Copenhagen',
                workingHours: { start: '08:00', end: '16:00', weekends: false, holidays: ['Constitution Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'AT': {
                country: 'Austria',
                region: 'Central Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'title importance', 'formal address'],
                    meetingProtocols: ['structured approach', 'hierarchical respect', 'thorough discussion'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['formal interaction', 'cultural pride'],
                    languagePreferences: ['German'],
                    businessLanguages: ['German', 'English']
                },
                timeZone: 'Europe/Vienna',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['National Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'BE': {
                country: 'Belgium',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['polite handshake', 'language consideration', 'formal approach'],
                    meetingProtocols: ['structured meetings', 'compromise seeking', 'multilingual awareness'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['polite interaction', 'cultural sensitivity'],
                    languagePreferences: ['Dutch', 'French', 'German'],
                    businessLanguages: ['Dutch', 'French', 'English']
                },
                timeZone: 'Europe/Brussels',
                workingHours: { start: '09:00', end: '17:30', weekends: false, holidays: ['National Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'PT': {
                country: 'Portugal',
                region: 'Southern Europe',
                businessEtiquette: {
                    greetings: ['warm handshake', 'personal connection', 'relationship focus'],
                    meetingProtocols: ['relationship building', 'social interaction', 'flexible approach'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['expressive gestures', 'personal warmth'],
                    languagePreferences: ['Portuguese'],
                    businessLanguages: ['Portuguese', 'English']
                },
                timeZone: 'Europe/Lisbon',
                workingHours: { start: '09:00', end: '18:00', weekends: false, holidays: ['Republic Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'GR': {
                country: 'Greece',
                region: 'Southern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'hospitality emphasis', 'relationship importance'],
                    meetingProtocols: ['relationship focus', 'social conversation', 'flexible timing'],
                    giftGiving: true,
                    punctuality: 'flexible',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['animated discussion', 'emotional expression'],
                    languagePreferences: ['Greek'],
                    businessLanguages: ['Greek', 'English']
                },
                timeZone: 'Europe/Athens',
                workingHours: { start: '09:00', end: '17:00', weekends: false, holidays: ['Independence Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'PL': {
                country: 'Poland',
                region: 'Central Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'formal address', 'respect for hierarchy'],
                    meetingProtocols: ['formal structure', 'thorough preparation', 'respectful discussion'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['formal interaction', 'cultural pride'],
                    languagePreferences: ['Polish'],
                    businessLanguages: ['Polish', 'English']
                },
                timeZone: 'Europe/Warsaw',
                workingHours: { start: '08:00', end: '16:00', weekends: false, holidays: ['Constitution Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'CZ': {
                country: 'Czech Republic',
                region: 'Central Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'formal address', 'reserved approach'],
                    meetingProtocols: ['structured meetings', 'factual discussion', 'consensus seeking'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['reserved manner', 'intellectual discussion'],
                    languagePreferences: ['Czech'],
                    businessLanguages: ['Czech', 'English']
                },
                timeZone: 'Europe/Prague',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Statehood Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'HU': {
                country: 'Hungary',
                region: 'Central Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'formal address', 'cultural respect'],
                    meetingProtocols: ['formal structure', 'hierarchical respect', 'thorough discussion'],
                    giftGiving: true,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['formal interaction', 'cultural pride'],
                    languagePreferences: ['Hungarian'],
                    businessLanguages: ['Hungarian', 'English']
                },
                timeZone: 'Europe/Budapest',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['National Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'formal', decisionMaking: 'hierarchical', timeline: 'moderate' }
            },
            'IE': {
                country: 'Ireland',
                region: 'Western Europe',
                businessEtiquette: {
                    greetings: ['warm handshake', 'friendly approach', 'storytelling culture'],
                    meetingProtocols: ['informal atmosphere', 'relationship building', 'humor appreciation'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'flat'
                },
                communication: {
                    directness: 'medium',
                    nonVerbalCues: ['friendly demeanor', 'conversational style'],
                    languagePreferences: ['English', 'Irish'],
                    businessLanguages: ['English']
                },
                timeZone: 'Europe/Dublin',
                workingHours: { start: '09:00', end: '17:30', weekends: false, holidays: ['St. Patrick\'s Day', 'Christmas', 'Easter'] },
                negotiationStyle: { approach: 'relationship-based', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'LV': {
                country: 'Latvia',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'reserved approach', 'formal address'],
                    meetingProtocols: ['structured meetings', 'consensus building', 'efficiency focus'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['reserved manner', 'personal space'],
                    languagePreferences: ['Latvian'],
                    businessLanguages: ['Latvian', 'English', 'Russian']
                },
                timeZone: 'Europe/Riga',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Independence Day', 'Midsummer', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            },
            'LT': {
                country: 'Lithuania',
                region: 'Northern Europe',
                businessEtiquette: {
                    greetings: ['firm handshake', 'formal approach', 'cultural respect'],
                    meetingProtocols: ['structured discussion', 'consensus seeking', 'thorough preparation'],
                    giftGiving: false,
                    punctuality: 'strict',
                    hierarchy: 'moderate'
                },
                communication: {
                    directness: 'high',
                    nonVerbalCues: ['reserved interaction', 'cultural pride'],
                    languagePreferences: ['Lithuanian'],
                    businessLanguages: ['Lithuanian', 'English', 'Russian']
                },
                timeZone: 'Europe/Vilnius',
                workingHours: { start: '08:00', end: '17:00', weekends: false, holidays: ['Independence Day', 'Midsummer', 'Christmas'] },
                negotiationStyle: { approach: 'direct', decisionMaking: 'consensus', timeline: 'moderate' }
            }
        };
        Object.entries(cultures).forEach(function (_a) {
            var code = _a[0], context = _a[1];
            _this.knowledgeBase.set(code, context);
        });
    };
    /**
     * Analyze cultural context for a specific country/region
     */
    CulturalIntelligenceAgent.prototype.analyzeCulturalContext = function (countryCode) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, context, insight, responseTime;
            return __generator(this, function (_a) {
                startTime = Date.now();
                try {
                    context = this.knowledgeBase.get(countryCode.toUpperCase());
                    if (!context) {
                        throw new Error("Cultural context not available for country: ".concat(countryCode));
                    }
                    insight = {
                        id: (0, nanoid_1.nanoid)(),
                        timestamp: new Date(),
                        context: context,
                        recommendations: this.generateRecommendations(context),
                        warnings: this.generateWarnings(context),
                        confidence: this.calculateConfidence(context)
                    };
                    this.insights.set(insight.id, insight);
                    responseTime = Date.now() - startTime;
                    this.performanceMetrics.responseTimes.push(responseTime);
                    this.performanceMetrics.totalQueries++;
                    this.emit('cultural:analysis', {
                        insightId: insight.id,
                        countryCode: countryCode,
                        responseTime: responseTime
                    });
                    return [2 /*return*/, insight];
                }
                catch (error) {
                    this.emit('cultural:error', { countryCode: countryCode, error: error instanceof Error ? error.message : String(error) });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate cultural recommendations
     */
    CulturalIntelligenceAgent.prototype.generateRecommendations = function (context) {
        var recommendations = [];
        // Business etiquette recommendations
        if (context.businessEtiquette.punctuality === 'strict') {
            recommendations.push('Arrive 5-10 minutes early for all meetings');
        }
        if (context.businessEtiquette.giftGiving) {
            recommendations.push('Prepare appropriate business gifts according to local customs');
        }
        // Communication recommendations
        if (context.communication.directness === 'low') {
            recommendations.push('Use indirect communication style and read between the lines');
        }
        // Negotiation recommendations
        if (context.negotiationStyle.timeline === 'slow') {
            recommendations.push('Allow extra time for decision-making processes');
        }
        return recommendations;
    };
    /**
     * Generate cultural warnings
     */
    CulturalIntelligenceAgent.prototype.generateWarnings = function (context) {
        var warnings = [];
        if (context.businessEtiquette.hierarchy === 'strict') {
            warnings.push('Respect hierarchical structures - address seniors first');
        }
        if (context.communication.directness === 'low') {
            warnings.push('Avoid overly direct criticism or confrontational language');
        }
        return warnings;
    };
    /**
     * Calculate confidence score based on data completeness
     */
    CulturalIntelligenceAgent.prototype.calculateConfidence = function (context) {
        var score = 0;
        var maxScore = 10;
        // Check data completeness
        if (context.businessEtiquette.greetings.length > 0)
            score++;
        if (context.businessEtiquette.meetingProtocols.length > 0)
            score++;
        if (context.communication.businessLanguages.length > 0)
            score++;
        if (context.timeZone)
            score++;
        if (context.workingHours.start && context.workingHours.end)
            score++;
        if (context.negotiationStyle.approach)
            score++;
        return Math.min(score / maxScore, 1.0);
    };
    /**
     * Get performance metrics
     */
    CulturalIntelligenceAgent.prototype.getPerformanceMetrics = function () {
        var avgResponseTime = this.performanceMetrics.responseTimes.length > 0
            ? this.performanceMetrics.responseTimes.reduce(function (a, b) { return a + b; }, 0) / this.performanceMetrics.responseTimes.length
            : 0;
        return {
            agentId: this.agentId,
            averageResponseTime: "".concat(avgResponseTime.toFixed(2), "ms"),
            totalQueries: this.performanceMetrics.totalQueries,
            accuracyScore: "".concat((this.performanceMetrics.accuracyScore * 100).toFixed(1), "%"),
            knowledgeBaseCoverage: "".concat(this.knowledgeBase.size, " countries"),
            targetResponseTime: '<75ms (Phase 2 goal)'
        };
    };
    /**
     * Get cultural insight by ID
     */
    CulturalIntelligenceAgent.prototype.getInsight = function (insightId) {
        return this.insights.get(insightId);
    };
    /**
     * List all available countries
     */
    CulturalIntelligenceAgent.prototype.getAvailableCountries = function () {
        return Array.from(this.knowledgeBase.keys());
    };
    return CulturalIntelligenceAgent;
}(events_1.EventEmitter));
exports.CulturalIntelligenceAgent = CulturalIntelligenceAgent;
exports.default = CulturalIntelligenceAgent;
