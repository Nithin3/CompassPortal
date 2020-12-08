/*jslint node: true */
'use strict';

//import modules
const moment = require('moment');
const viewDateTimeFormat = "MM/DD/YYYY hh:mm a";
const chartDateFormat = "MM/DD/YYYY";

//captions
const DAILY_DIARY = "DailyDiary";
const WORRY_HEADS = "WorryHeads";
const MAKE_BELIEVE = "MakeBelieve";
const EMOTIONS = "Emotions";
const RELAXATION = "Relaxation";
const STAND_UP = "StandUp";

//activity state captions
const PENDING = "pending";
const IN_PROGRESS = "in progress";
const COMPLETED = "completed";
const EXPIRED = "expired";