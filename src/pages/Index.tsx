import React from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { StudyTimer } from "../components/StudyTimer";
import MotivationalQuotes from "../components/MotivationalQuotes";
import CourseContent from "../components/CourseContent";
import Library from "../components/Library";
import Questions from "../components/Questions";
import ChatAssistant from "../components/ChatAssistant";
import CourseSchedule from "../components/CourseSchedule";
import LearningJournal from "../components/LearningJournal";
import { YouTubeLibrary } from "../components/YouTubeLibrary";
import { TwitterLibrary } from "../components/TwitterLibrary";
import { Documents } from "../components/Documents";
import { Calendar } from "../components/Calendar";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>
            ברוך הבא
          </Text>
          
          <View style={styles.grid}>
            <StudyTimer />
            <ChatAssistant />
          </View>

          <View style={styles.section}>
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "right",
  },
  grid: {
    marginVertical: 20,
  },
  section: {
    gap: 20,
  }
});
