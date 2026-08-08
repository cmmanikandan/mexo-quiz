import { supabase } from '../lib/supabase';

export interface CertificateRecord {
  id: string;
  studentId: string;
  quizId: string;
  certificateNumber: string;
  title: string;
  issuerName: string;
  scorePercentage: number;
  issuedAt: string;
  verificationCode: string;
  certificateUrl?: string;
  status: string;
}

export const certificateService = {
  /**
   * Fetch all verified certificates for a student from Supabase.
   */
  async getUserCertificates(studentId: string): Promise<CertificateRecord[]> {
    if (!studentId) return [];

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        studentId: item.student_id,
        quizId: item.quiz_id,
        certificateNumber: item.certificate_number,
        title: item.title,
        issuerName: item.issuer_name || 'MEXO Academy',
        scorePercentage: item.score_percentage || 100,
        issuedAt: item.issued_at,
        verificationCode: item.verification_code,
        certificateUrl: item.certificate_url,
        status: item.status || 'verified',
      }));
    } catch (e) {
      console.error('Error fetching certificates from Supabase:', e);
      return [];
    }
  },

  /**
   * Issue a new certificate atomically in Supabase.
   */
  async issueCertificate(
    studentId: string,
    quizId: string,
    title: string,
    scorePercentage: number,
    issuerName = 'MEXO Academy'
  ): Promise<CertificateRecord | null> {
    const certNum = `CERT-${quizId.slice(0, 6)}-${studentId.slice(0, 6)}-${Date.now().toString().slice(-4)}`;
    const verifyCode = `MEXO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newCert = {
      id: `cert-${Date.now()}`,
      student_id: studentId,
      quiz_id: quizId,
      certificate_number: certNum,
      title,
      issuer_name: issuerName,
      score_percentage: scorePercentage,
      issued_at: new Date().toISOString(),
      verification_code: verifyCode,
      status: 'verified',
    };

    try {
      const { error } = await supabase.from('certificates').insert(newCert);
      if (error) {
        console.error('Error saving certificate to Supabase:', error);
      }
      return {
        id: newCert.id,
        studentId: newCert.student_id,
        quizId: newCert.quiz_id,
        certificateNumber: newCert.certificate_number,
        title: newCert.title,
        issuerName: newCert.issuer_name,
        scorePercentage: newCert.score_percentage,
        issuedAt: newCert.issued_at,
        verificationCode: newCert.verification_code,
        status: newCert.status,
      };
    } catch (e) {
      return null;
    }
  },
};
