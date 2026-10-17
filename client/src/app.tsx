import React from 'react';
import { Route, Routes } from 'react-router-dom';

import HomePage from './pages/Home/HomePage';
import UploadPage from './pages/Upload/UploadPage';
import QuizPage from './pages/Quiz/QuizPage';
import AnalyzingPage from './pages/Analyzing/AnalyzingPage';
import ReportPreviewPage from './pages/ReportPreview/ReportPreviewPage';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentResultPage from './pages/Payment/PaymentResultPage';
import ReportFullPage from './pages/ReportFull/ReportFullPage';
import AdminPage from './pages/Admin/AdminPage';
import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="analyzing" element={<AnalyzingPage />} />
        <Route path="report/preview" element={<ReportPreviewPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="payment/result" element={<PaymentResultPage />} />
        <Route path="report/full" element={<ReportFullPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
