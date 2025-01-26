import React from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "right" }}>
            ברוך הבא
          </Text>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudyTimer />
            <ChatAssistant />
          </div>

          <div className="space-y-6">
            <Calendar />
            <MotivationalQuotes />
            <CourseContent />
            <CourseSchedule />
            <Library />
            <Documents />
            <YouTubeLibrary />
            <TwitterLibrary />
            <Questions />
            <LearningJournal />
          </div>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
