import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Printer, Trash2, Plus, Layout } from 'lucide-react';

const INITIAL_STUDENT = {
  rollNo: '',
  name: '',
  q1: '', q2: '', q3: '', q4: '', q5: '', q6: '',
  objective: '',
  mid1: '', mid2: '',
};

function App() {
  const [calculationMode, setCalculationMode] = useState('single');
  const [facultyName, setFacultyName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('II B.Tech II Semester (CSE) I Internal Examinations Feb - 2026');
  const [students, setStudents] = useState([INITIAL_STUDENT]);
  const fileInputRef = useRef(null);

  const calculateResult = (student) => {
    if (calculationMode === 'single') {
      const q1 = Number(student.q1) || 0;
      const q2 = Number(student.q2) || 0;
      const q3 = Number(student.q3) || 0;
      const q4 = Number(student.q4) || 0;
      const q5 = Number(student.q5) || 0;
      const q6 = Number(student.q6) || 0;
      const objective = Number(student.objective) || 0;

      const m1 = Math.max(q1, q2);
      const m2 = Math.max(q3, q4);
      const m3 = Math.max(q5, q6);

      const total30 = m1 + m2 + m3;
      const descriptive15 = Math.ceil(total30 / 2);
      const final25 = descriptive15 + objective;

      return { total30, descriptive15, final25 };
    } else {
      const m1 = Number(student.mid1) || 0;
      const m2 = Number(student.mid2) || 0;
      const maxMid = Math.max(m1, m2);
      const minMid = Math.min(m1, m2);
      const final25 = Math.round(maxMid * 0.8 + minMid * 0.2);
      return { final25 };
    }
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const processed = data
        .filter(row => row.length >= 2 && row[0] && row[1])
        .map(row => ({
          ...INITIAL_STUDENT,
          rollNo: String(row[0] || ''),
          name: String(row[1] || ''),
        }))
        .filter(s => !['roll no', 's.no', 'serial'].includes(s.rollNo.toLowerCase()) && s.rollNo.length > 2);

      setStudents(processed);
    };
    reader.readAsBinaryString(file);
  };

  const updateStudentField = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  return (
    <div className="container">
      <div className="no-print">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Student Marks Portal</h1>
            <button
              className="btn btn-outline"
              onClick={() => setCalculationMode(calculationMode === 'single' ? 'consolidated' : 'single')}
            >
              <Layout size={18} />
              {calculationMode === 'single' ? 'Switch to Consolidated' : 'Switch to Single Exam'}
            </button>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Faculty Name</label>
              <input className="input-field" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} placeholder="e.g. Sheshadri" />
            </div>
            <div className="input-group">
              <label>Course Code</label>
              <input className="input-field" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSEM305" />
            </div>
            <div className="input-group">
              <label>Subject Name</label>
              <input className="input-field" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. DBMS" />
            </div>
            <div className="input-group">
              <label>Semester / Examination</label>
              <input className="input-field" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>

          <div className="button-row">
            <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>
              <FileSpreadsheet size={18} />
              Import Student Excel
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleExcelImport} />
            <button className="btn btn-success" onClick={() => window.print()}>
              <Printer size={18} />
              Print Award List
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', width: '140px' }}>Roll No</th>
                  <th style={{ textAlign: 'left', width: '220px' }}>Name</th>
                  {calculationMode === 'single' ? (
                    <>
                      <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th><th>Q6</th>
                      <th>Obj</th>
                    </>
                  ) : (
                    <>
                      <th>Mid 1 (25)</th>
                      <th>Mid 2 (25)</th>
                    </>
                  )}
                  <th>Final</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const res = calculateResult(student);
                  return (
                    <tr key={index}>
                      <td><input className="input-field" style={{ padding: '0.4rem', fontSize: '0.9rem' }} value={student.rollNo} onChange={(e) => updateStudentField(index, 'rollNo', e.target.value)} /></td>
                      <td><input className="input-field" style={{ textAlign: 'left', padding: '0.4rem', fontSize: '0.9rem' }} value={student.name} onChange={(e) => updateStudentField(index, 'name', e.target.value)} /></td>
                      {calculationMode === 'single' ? (
                        <>
                          <td><input className="marks-input" value={student.q1} onChange={(e) => updateStudentField(index, 'q1', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.q2} onChange={(e) => updateStudentField(index, 'q2', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.q3} onChange={(e) => updateStudentField(index, 'q3', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.q4} onChange={(e) => updateStudentField(index, 'q4', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.q5} onChange={(e) => updateStudentField(index, 'q5', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.q6} onChange={(e) => updateStudentField(index, 'q6', e.target.value)} /></td>
                          <td><input className="marks-input" value={student.objective} onChange={(e) => updateStudentField(index, 'objective', e.target.value)} /></td>
                        </>
                      ) : (
                        <>
                          <td><input className="marks-input" style={{ maxWidth: '100px' }} value={student.mid1} onChange={(e) => updateStudentField(index, 'mid1', e.target.value)} /></td>
                          <td><input className="marks-input" style={{ maxWidth: '100px' }} value={student.mid2} onChange={(e) => updateStudentField(index, 'mid2', e.target.value)} /></td>
                        </>
                      )}
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>{res.final25}</td>
                      <td>
                        <button onClick={() => setStudents(students.filter((_, i) => i !== index))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => setStudents([...students, { ...INITIAL_STUDENT }])}>
            <Plus size={18} /> Add Row
          </button>
        </div>
      </div>

      {/* Formal Print View */}
      <div className="print-only">
        <div className="print-header">
          <h1>SV COLLEGE OF ENGINEERING</h1>
          <div style={{ fontWeight: 'bold' }}>(AUTONOMOUS)</div>
          <div style={{ fontSize: '0.8rem' }}>Karakambadi Road, Tirupati-517507</div>
          <div style={{ marginTop: '1rem', fontWeight: 600 }}>{semester}</div>
          <h2 style={{ marginTop: '1rem', textDecoration: 'underline', fontSize: '1.2rem' }}>Award List</h2>
        </div>

        <div className="print-info">
          <div>
            <div><strong>Name of the Subject:</strong> {subjectName || '________________'}</div>
            <div><strong>Name of the Faculty:</strong> {facultyName || '________________'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Subject Code:</strong> {courseCode || '__________'}</div>
          </div>
        </div>

        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
          <thead>
            {calculationMode === 'single' ? (
              <>
                <tr>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>S.No</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Roll Number</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Name of the Student</th>
                  <th colSpan="6" style={{ border: '1px solid black' }}>Descriptive Marks</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Total(30)</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Des(15)</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Obj(10)</th>
                  <th rowSpan="2" style={{ border: '1px solid black' }}>Final(25)</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid black' }}>Q1</th><th style={{ border: '1px solid black' }}>Q2</th><th style={{ border: '1px solid black' }}>Q3</th>
                  <th style={{ border: '1px solid black' }}>Q4</th><th style={{ border: '1px solid black' }}>Q5</th><th style={{ border: '1px solid black' }}>Q6</th>
                </tr>
              </>
            ) : (
              <tr>
                <th style={{ border: '1px solid black' }}>S.No</th>
                <th style={{ border: '1px solid black' }}>Roll Number</th>
                <th style={{ border: '1px solid black' }}>Name of the Student</th>
                <th style={{ border: '1px solid black' }}>Mid 1 (25M)</th>
                <th style={{ border: '1px solid black' }}>Mid 2 (25M)</th>
                <th style={{ border: '1px solid black' }}>Final (25M)</th>
              </tr>
            )}
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const res = calculateResult(student);
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid black' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid black' }}>{student.rollNo}</td>
                  <td style={{ border: '1px solid black', textAlign: 'left', paddingLeft: '5px' }}>{student.name}</td>
                  {calculationMode === 'single' ? (
                    <>
                      <td style={{ border: '1px solid black' }}>{student.q1 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.q2 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.q3 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.q4 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.q5 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.q6 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{res.total30}</td>
                      <td style={{ border: '1px solid black' }}>{res.descriptive15}</td>
                      <td style={{ border: '1px solid black' }}>{student.objective || 0}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ border: '1px solid black' }}>{student.mid1 || '-'}</td>
                      <td style={{ border: '1px solid black' }}>{student.mid2 || '-'}</td>
                    </>
                  )}
                  <td style={{ border: '1px solid black', fontWeight: 'bold' }}>{res.final25}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="sign-row">
          <div className="sign-box">Faculty Sign</div>
          <div className="sign-box">HOD Sign</div>
        </div>
      </div>
    </div>
  );
}

export default App;
