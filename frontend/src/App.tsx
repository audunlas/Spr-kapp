import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { DocumentListPage } from "./features/documents/DocumentListPage";
import { UploadPage } from "./features/documents/UploadPage";
import { ReaderPage } from "./features/reader/ReaderPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { VocabListsPage } from "./features/vocab/VocabListsPage";
import { VocabListPage } from "./features/vocab/VocabListPage";
import { PracticePage } from "./features/vocab/PracticePage";
import { MyClassesPage } from "./features/classes/MyClassesPage";
import { ClassManagePage } from "./features/classes/ClassManagePage";
import { ClassViewPage } from "./features/classes/ClassViewPage";
import { ExerciseEditPage } from "./features/exercises/ExerciseEditPage";
import { ExercisePlayPage } from "./features/exercises/ExercisePlayPage";
import { HelpPage } from "./features/help/HelpPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/learn/:lang"
              element={
                <ProtectedRoute>
                  <DocumentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:lang/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:lang/vocab"
              element={
                <ProtectedRoute>
                  <VocabListsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:lang/vocab/:listId"
              element={
                <ProtectedRoute>
                  <VocabListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:lang/vocab/:listId/practice"
              element={
                <ProtectedRoute>
                  <PracticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/read/:documentId"
              element={
                <ProtectedRoute>
                  <ReaderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <MyClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/:classId/manage"
              element={
                <ProtectedRoute>
                  <ClassManagePage />
                </ProtectedRoute>
              }
            />
            <Route path="/class/:shareCode" element={<ClassViewPage />} />
            <Route
              path="/classes/:classId/exercises/new"
              element={
                <ProtectedRoute>
                  <ExerciseEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercises/:exerciseId/edit"
              element={
                <ProtectedRoute>
                  <ExerciseEditPage />
                </ProtectedRoute>
              }
            />
            <Route path="/exercises/:exerciseId/play" element={<ExercisePlayPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to={`/learn/${localStorage.getItem("targetLanguage") ?? "es"}`} replace />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
