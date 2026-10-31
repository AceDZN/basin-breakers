import type {Point} from '../levels';

export type ReliefFeature={at:Point;rx:number;rz:number;height:number;angle?:number;fixed?:boolean};
export type Wetland={at:Point;rx:number;rz:number;rate:number};
export type FreeformLevel={
 id:number;title:string;brief:string;lesson:string;source:Point;homes:Point[];
 earthBudget:number;maxWalls:number;safeTarget:number;pulses:{volume:number;rate:number;delay:number}[];
 duration:number;terrain:{centerX:number;slope:number;crossSlope:number;bankHeight:number;gullyDepth:number;gullyWidth:number;coastDrop:number;features:ReliefFeature[]};
 wetlands:Wetland[];infiltrationGoal:number;
};
type Overrides=Partial<Omit<FreeformLevel,'terrain'>>&{terrain?:Partial<FreeformLevel['terrain']>};
const make=(id:number,title:string,brief:string,lesson:string,o:Overrides={}):FreeformLevel=>({
 id,title,brief,lesson,source:[14,3],homes:[[10,16],[15,17],[20,15]],earthBudget:155,maxWalls:3,safeTarget:64,
 pulses:[{volume:80,rate:4,delay:0}],duration:100,wetlands:[],infiltrationGoal:0,...o,
 terrain:{centerX:14,slope:.205,crossSlope:0,bankHeight:1.4,gullyDepth:.32,gullyWidth:4.5,coastDrop:0,features:[],...o.terrain},
});

/** Authored geography and finite storms only. Player constructions are never stored here. */
export const FREEFORM_LEVELS:FreeformLevel[]=[
 make(1,'הצילו את הכפר','חפרו תעלות והציבו סוללות כדי להסיט את השיטפון מהבתים אל הים.','הבתים בטוחים והגל הגיע לים.'),
 make(2,'מים ממערב','המאגר במערב. שלושה בתים במדרון שממול. מצאו דרך בטוחה לים.','מקור אחר משנה את הגישה אל הכפר.',{source:[8,3],homes:[[17,14],[19,18],[23,16]],maxWalls:2,terrain:{centerX:18,crossSlope:-.025,features:[{at:[20,10],rx:1.4,rz:2.7,height:1.5,fixed:true}]}}),
 make(3,'מים ממזרח','הגל מגיע ממזרח. התכנית הקודמת לא בהכרח מתאימה למדרון החדש.','קוראים את השטח מחדש כשהמקור עובר.',{source:[20,3],homes:[[6,16],[11,18],[16,14]],terrain:{centerX:12,crossSlope:.02},earthBudget:145}),
 make(4,'שלושה במורד','הבתים ניצבים בזה אחר זה. הגנו גם על החצר האחרונה במורד.','הסטה מקומית יכולה להעביר את הסיכון למורד.',{homes:[[12,12],[16,16],[12,19]],terrain:{gullyDepth:.42,gullyWidth:5},earthBudget:140}),
 make(5,'גב האבן','אי אבן חוצה את הכתף המערבית. האבן קבועה; האדמה סביבו ניתנת לשינוי.','תעלה רציפה צריכה לעקוף מחסום שאי אפשר לחפור.',{terrain:{features:[{at:[8,12],rx:1.6,rz:2.5,height:1.7,fixed:true}]},homes:[[11,15],[15,18],[21,16]]}),
 make(6,'הכתף הנמוכה','המדרון נוטה הצידה. בחרו הסטה לפי הגובה, לא רק לפי המרחק.','שיפוע רוחבי משנה את פיצול הזרימה.',{terrain:{crossSlope:-.045,gullyDepth:.22,coastDrop:.6},homes:[[11,16],[17,17],[21,14]],earthBudget:135}),
 make(7,'סוללה אחת','רק סוללה אחת זמינה. חפירה ממוקדת יכולה לעשות את שאר העבודה.','מיקום מחסום חשוב יותר ממספר המחסומים.',{source:[12,3],maxWalls:1,earthBudget:125,homes:[[9,16],[14,17],[20,15]],terrain:{centerX:13,gullyDepth:.25}}),
 make(8,'שני גלים','שני גלים באותו מאגר. התכנית צריכה להישאר בטוחה עד סוף הבדיקה.','מעבר בטוח לגל הראשון אינו הוכחה לשני.',{pulses:[{volume:38,rate:4,delay:0},{volume:42,rate:4,delay:34}],homes:[[10,14],[15,18],[20,16]],terrain:{gullyWidth:5.5}}),
 make(9,'הקרקע ששותה','האחו הירוק חדיר. חדשו לפחות 2 יחידות בקרקע והעבירו 60 לים.','חלחול מעביר את אותם המים למאגר תת־קרקעי.',{safeTarget:60,infiltrationGoal:2,wetlands:[{at:[6,13],rx:2.5,rz:3,rate:.005}],homes:[[11,16],[15,18],[20,14]]}),
 make(10,'חוף תלול','הבית העליון קרוב לגל; הבתים במורד לצד כתף אדמה. צרו מעבר רחב לפני החצר המאוימת.','יירוט מוקדם ורוחב המעבר משנים את פיצול השיא.',{terrain:{slope:.235,gullyDepth:.4,coastDrop:.6,features:[{at:[17,16],rx:4,rz:3,height:.3}]},homes:[[13,12],[16,16],[20,18]],earthBudget:140}),
 make(11,'מעבר בין סלעים','שני איי אבן מחלקים את השטח. בחרו מעבר אמיתי והשאירו לו מוצא.','חסימה קשיחה משנה את אפשרויות הניקוז.',{source:[12,3],terrain:{coastDrop:.6,features:[{at:[8,11],rx:1.4,rz:2,height:1.5,fixed:true},{at:[20,14],rx:1.3,rz:2.2,height:1.5,fixed:true}]},homes:[[11,15],[15,18],[22,18]],earthBudget:150}),
 make(12,'מפרץ ארוך','סף אדמה נמוך ליד החוף עלול לכלוא מים. השלימו את הקשר עד הים.','תעלה עמוקה בלי מוצא משאירה מים בשטח.',{terrain:{slope:.195,features:[{at:[14,19],rx:10,rz:1.2,height:.3}]},homes:[[10,15],[15,17],[20,14]],earthBudget:120,safeTarget:60}),
 make(13,'גשם קצר וחזק','אותה כמות מגיעה מהר יותר. השאירו מקום לזרם לפני שהוא מתפשט.','שיא הספיקה והכמות הכוללת אינם אותו דבר.',{pulses:[{volume:84,rate:6,delay:0}],safeTarget:66,terrain:{gullyDepth:.2,gullyWidth:6},earthBudget:150,homes:[[10,15],[15,17],[20,16]]}),
 make(14,'הבתים המפוזרים','שלוש החצרות רחוקות זו מזו. עקיפה של בית אחד עלולה לכוון מים לאחר.','בטיחות הכפר נבדקת בכל שלוש החצרות.',{homes:[[7,15],[14,18],[22,14]],terrain:{bankHeight:1.1,gullyWidth:6},maxWalls:2,earthBudget:145}),
 make(15,'ערוץ נוטה','הערוץ הטבעי והשיפוע הרוחבי זזו מערבה. תכננו לפי המפלסים החדשים.','מים מגיבים לתבליט, לא לכיוון המסך.',{source:[17,3],homes:[[7,16],[12,17],[18,15]],terrain:{centerX:11,crossSlope:.045,gullyDepth:.4},earthBudget:140}),
 make(16,'הגל המאוחר','גל ראשון קטן ואחריו גל גדול. אל תסיימו את התכנית לפי הרושם הראשון.','צריך להשאיר קיבולת גם למים שעדיין לא שוחררו.',{pulses:[{volume:26,rate:3,delay:0},{volume:62,rate:5,delay:42}],safeTarget:68,terrain:{gullyWidth:5.3},homes:[[11,14],[16,18],[21,16]],earthBudget:150}),
 make(17,'אחו במזרח','במערב אבן ובמזרח אחו חדיר. חדשו 3 יחידות בקרקע והשאירו 61 לים.','חידוש מי תהום ומעבר במורד חולקים מקור סופי.',{source:[16,3],homes:[[9,15],[14,18],[19,16]],safeTarget:61,infiltrationGoal:3,wetlands:[{at:[23,13],rx:2,rz:3.5,rate:.008}],terrain:{features:[{at:[7,12],rx:1.5,rz:2.8,height:1.8,fixed:true}]}}),
 make(18,'מעט אדמה','התקציב קצר ושתי סוללות זמינות. מלאו חפירה מיותרת כדי לפנות אדמה לתכנית טובה יותר.','שינוי נוף מוגבל במשאבים וניתן לתיקון.',{source:[10,3],homes:[[9,14],[14,18],[20,16]],earthBudget:88,maxWalls:2,terrain:{centerX:12,crossSlope:.01,gullyDepth:.25}}),
 make(19,'כפר על המדרגה','כתף רחבה עולה לצד הבתים. בדקו שהמעקף נשאר נמוך מהחצרות המאוימות.','סף מקומי יכול לעצור מסלול שנראה רציף מלמעלה.',{source:[15,3],homes:[[10,13],[15,17],[21,18]],terrain:{features:[{at:[19,12],rx:3.5,rz:2,height:.7}],gullyDepth:.4},earthBudget:145}),
 make(20,'נחל ארוך','הזרם חלש יותר אך נמשך זמן רב. חכו שכל הכמות תעבור לפני שמסיקים שהכפר בטוח.','זרם קטן לאורך זמן עדיין דורש מעבר מלא.',{pulses:[{volume:84,rate:2.2,delay:0}],safeTarget:66,terrain:{slope:.18,gullyWidth:5,coastDrop:.6},homes:[[11,15],[15,18],[19,14]],earthBudget:145}),
 make(21,'שתי קרקעות','שני שטחי אחו חדירים. חדשו לפחות 4 יחידות בקרקע והעבירו 61 לים.','אי אפשר לספור את אותם מים גם בחלחול וגם במוצא.',{safeTarget:61,infiltrationGoal:4,wetlands:[{at:[5,12],rx:2,rz:2.5,rate:.025},{at:[23,16],rx:2,rz:3,rate:.025}],terrain:{crossSlope:-.015,gullyDepth:.28,coastDrop:.4},homes:[[10,14],[15,18],[20,14]]}),
 make(22,'שיטפון כפול','שני גלים חזקים עוברים ליד אי אבן. השאירו מעקף שלא נחסם בשיא.','כמות, קצב ומחסום פועלים יחד על גובה המים.',{pulses:[{volume:44,rate:5.5,delay:0},{volume:52,rate:6,delay:36}],safeTarget:74,terrain:{features:[{at:[15,11],rx:1.2,rz:1.7,height:1.1,fixed:true}],gullyWidth:6},homes:[[10,15],[17,17],[22,16]],earthBudget:160}),
 make(23,'הכפר שמנגד','מאגר רחוק מהמרכז, חצרות חדשות ושיפוע הפוך. צרו תכנית משלכם לאגן הלא מוכר.','עיקרון הניקוז עובר לאגן אחר; הקואורדינטות אינן הפתרון.',{source:[7,3],homes:[[10,14],[16,17],[21,18]],terrain:{centerX:16,crossSlope:-.03,features:[{at:[20,10],rx:1.5,rz:2.2,height:1.6,fixed:true}]},earthBudget:135,maxWalls:2}),
 make(24,'אגן שלם','שני גלים, סלעים ואחו. הצילו את שלוש החצרות, חדשו 3 בקרקע והעבירו 72 לים.','תכנית לאגן שלם משלבת תבליט, שיא, חלחול ומקור סופי.',{source:[18,3],homes:[[8,15],[14,18],[20,14]],pulses:[{volume:38,rate:4.5,delay:0},{volume:58,rate:5.5,delay:40}],safeTarget:72,infiltrationGoal:3,earthBudget:150,maxWalls:2,wetlands:[{at:[5,14],rx:2,rz:3,rate:.006}],terrain:{centerX:13,crossSlope:.02,gullyWidth:5.5,features:[{at:[21,10],rx:1.3,rz:2.1,height:1.5,fixed:true},{at:[10,11],rx:3,rz:1.5,height:.45}]}}),
];
