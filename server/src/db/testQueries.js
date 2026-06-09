import pool from './connect.js';

/**
 * Test Queries File
 * Demonstrates various database operations:
 * 1. Database connectivity
 * 2. Get all users
 * 3. Get all exams
 * 4. Get one exam
 * 5. Loop through JSONB questions
 * 6. Additional query: Get exam submissions with user info
 */

async function runTests() {
  try {
    console.log('\n========== TEST QUERIES ==========\n');

    // 1. TEST DATABASE CONNECTIVITY
    console.log('1️⃣  Testing Database Connectivity...');
    try {
      const connectResult = await pool.query('SELECT NOW() as current_time, version() as db_version');
      console.log('✅ Connected! Current time:', connectResult.rows[0].current_time);
      console.log('   Database version:', connectResult.rows[0].db_version.split(',')[0]);
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }

    // 2. GET ALL USERS
    console.log('\n2️⃣  Fetching All Users...');
    const usersResult = await pool.query('SELECT id, username, role, name, created_at FROM users');
    console.log(`✅ Found ${usersResult.rows.length} user(s):`);
    usersResult.rows.forEach((user) => {
      console.log(`   - ${user.name} (${user.username}) - Role: ${user.role} - ID: ${user.id}`);
    });

    // 3. GET ALL EXAMS
    console.log('\n3️⃣  Fetching All Exams...');
    const examsResult = await pool.query('SELECT id, title, time_limit, passing_grade, created_at FROM exams');
    console.log(`✅ Found ${examsResult.rows.length} exam(s):`);
    examsResult.rows.forEach((exam) => {
      console.log(`   - "${exam.title}" (${exam.time_limit} min, Pass: ${exam.passing_grade}%) - ID: ${exam.id}`);
    });

    // 4. GET ONE EXAM (with details)
    console.log('\n4️⃣  Fetching One Exam with Full Details...');
    const oneExamResult = await pool.query('SELECT * FROM exams LIMIT 1');
    if (oneExamResult.rows.length > 0) {
      const exam = oneExamResult.rows[0];
      console.log(`✅ Exam Found:`);
      console.log(`   Title: ${exam.title}`);
      console.log(`   Time Limit: ${exam.time_limit} minutes`);
      console.log(`   Passing Grade: ${exam.passing_grade}%`);
      console.log(`   Created At: ${exam.created_at}`);
      console.log(`   Questions Field Type: ${typeof exam.questions}`);

      // 5. READ AND LOOP THROUGH JSONB QUESTIONS FIELD
      console.log('\n5️⃣  Looping Through JSONB Questions...');
      const questions = exam.questions; // This is already parsed JSON by node-pg
      console.log(`✅ Found ${questions.length} question(s) in "${exam.title}":`);
      
      questions.forEach((question, index) => {
        console.log(`\n   Question ${index + 1}:`);
        console.log(`      ID: ${question.id}`);
        console.log(`      Type: ${question.type}`);
        console.log(`      Text: ${question.text}`);
        
        if (question.options && Array.isArray(question.options)) {
          console.log(`      Options: ${question.options.join(', ')}`);
        }
        
        if (question.answer) {
          console.log(`      Correct Answer: ${question.answer}`);
        }
      });
    } else {
      console.log('⚠️  No exams found in the database.');
    }

    // 6. ADDITIONAL QUERY: Get Exam Submissions with User Info (JOIN)
    console.log('\n\n6️⃣  Additional Query: Exam Submissions with User Information...');
    const submissionsResult = await pool.query(`
      SELECT 
        s.id as submission_id,
        s.score,
        s.submitted_at,
        e.title as exam_title,
        u.name as student_name,
        u.username as student_username,
        jsonb_array_length(s.answers) as answer_count
      FROM submissions s
      JOIN exams e ON s.exam_id = e.id
      JOIN users u ON s.student_id = u.id
      ORDER BY s.submitted_at DESC
    `);
    
    if (submissionsResult.rows.length > 0) {
      console.log(`✅ Found ${submissionsResult.rows.length} submission(s):`);
      submissionsResult.rows.forEach((submission) => {
        console.log(`
   Student: ${submission.student_name} (${submission.student_username})
   Exam: ${submission.exam_title}
   Score: ${submission.score}%
   Answers Provided: ${submission.answer_count}
   Submitted: ${submission.submitted_at}`);
      });
    } else {
      console.log('⚠️  No submissions found in the database.');
    }

    console.log('\n========== ALL TESTS COMPLETED ==========\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
