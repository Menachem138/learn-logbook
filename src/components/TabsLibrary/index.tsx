import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Library from "../Library";
import YouTubeLibrary from "../YouTubeLibrary";

export function TabsLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname === "/youtube" ? "youtube" : "content";

  return (
    <Tabs value={currentTab} onValueChange={(value) => navigate(value === "youtube" ? "/youtube" : "/")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="content">ספריית תוכן</TabsTrigger>
        <TabsTrigger value="youtube">סרטוני YouTube</TabsTrigger>
      </TabsList>
      {currentTab === "content" ? <Library /> : <YouTubeLibrary />}
    </Tabs>
  );
}
