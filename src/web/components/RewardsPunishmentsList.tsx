import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RewardPunishment {
  title: string;
  items: string[];
}

const rewards: RewardPunishment[] = [
  {
    title: "תגמולים יומיים (מידיים)",
    items: [
      "משחק בסוני: 20–30 דקות",
      'פרגן לעצמך מול המראה: אמירה חיובית כמו: "אני גאה בעצמי על ההתמדה שלי!"',
      "משקה מפנק: קפה, תה, שוקו או משקה אחר שאתה אוהב",
      "חטיף בריא או קינוח קטן",
      "מוזיקה שאתה אוהב: כמה דקות להאזנה למוזיקה מרגיעה או ממריצה"
    ]
  },
  {
    title: "תגמולים שבועיים",
    items: [
      "בילוי קטן: צפייה בסרט, הזמנת אוכל ממסעדה, זמן איכות עם חברים או משפחה",
      "מתנה קטנה לעצמך: חולצה, ספר, אביזר לסוני, או כל דבר קטן שתרצה",
      "שעת חופש: קח זמן פנוי לעשות משהו שאתה אוהב"
    ]
  },
  {
    title: "תגמולים חודשיים",
    items: [
      "בילוי משמעותי: יציאה למסעדה יוקרתית, טיול יום עם המשפחה או החברים",
      "מתנה לעצמך: פריט שתכננת לקנות כמו אוזניות חדשות, בושם, או אביזר טכנולוגי",
      "יום חופש מיוחד: יום שבו אתה עושה רק דברים שאתה נהנה מהם, ללא התחייבויות"
    ]
  }
];

const punishments: RewardPunishment[] = [
  {
    title: "עונשים יומיים (קלים)",
    items: [
      'עמידה מול המראה: אמור לעצמך: "אני אוהב אותך, אבל אני מאוכזב שלא עמדת במילה שלך. אתה ראוי ליותר."',
      "כתיבה ביומן: תאר מה גרם לך לפספס ואיך תוכל למנוע את זה בפעם הבאה"
    ]
  },
  {
    title: "עונשים שבועיים (בינוניים)",
    items: [
      "ביטול בילוי מתוכנן: כמו משחק בסוני או מפגש חברים",
      "ריצה או ספרינטים: 10 ספרינטים בחדר או ריצה של 5 דקות",
      "צמצום הנאה: ויתור על משקה מפנק או חטיף מתוק לאותו יום"
    ]
  },
  {
    title: "עונשים חודשיים (כבדים)",
    items: [
      "כתיבת תוכנית פעולה: הקדש שעה לכתיבת תוכנית למניעת פספוסים בעתיד",
      "ויתור על בילוי משמעותי: למשל, דחיית יציאה למסעדה או טיול שתכננת",
      "יום ללא פינוקים: יום שבו אתה מתמקד רק במטלות ולא נהנה מתגמולים"
    ]
  }
];

export default function RewardsPunishmentsList() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>רשימת תגמולים ועונשים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rewards">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">תגמולים</TabsTrigger>
            <TabsTrigger value="punishments">עונשים</TabsTrigger>
          </TabsList>
          <TabsContent value="rewards">
            {rewards.map((category, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-green-600">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="punishments">
            {punishments.map((category, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-red-600">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>דגשים חשובים</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>התגמולים: נועדו לעודד מוטיבציה ולחזק את ההרגלים החיוביים.</li>
              <li>העונשים: לא נועדו להעניש אותך בצורה קשה אלא לעזור לך לשפר את ההתנהלות שלך ולשמור על מחויבות.</li>
              <li>איזון: תמיד חשוב לשמור על יחס בריא בין עונשים לתגמולים – יותר תגמולים על הצלחות מאשר עונשים על כישלונות.</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}