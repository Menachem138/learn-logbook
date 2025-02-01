import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

const quotes = [
  {
    quote: "ההצלחה היא סך כל המאמצים הקטנים שחוזרים על עצמם יום אחר יום.",
    author: "רוברט קולייר",
  },
  {
    quote: "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו.",
    author: "פיטר דרוקר",
  },
  {
    quote: "כל מומחה היה פעם מתחיל.",
    author: "רותרפורד ב. הייז",
  },
  {
    quote: "ההשקעה בידע משלמת את הריבית הטובה ביותר.",
    author: "בנג'מין פרנקלין",
  },
  {
    quote: "הצעד הראשון להצלחה הוא האמונה שאתה יכול.",
    author: "טוני רובינס",
  },
];

export default function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <div className="text-center space-y-4 animate-fadeIn">
        <blockquote className="text-xl italic">"{currentQuote.quote}"</blockquote>
        <footer className="text-sm">- {currentQuote.author}</footer>
      </div>
    </Card>
  );
}