const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runVerification = async () => {
  console.log('========================================================');
  console.log(' STARTING FULL-STACK AUTOMATED TEST SUITE FOR CONNECTLY');
  console.log('========================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.data?.success, 'GET /api/health returns 200');

    // 2. Login as Alex
    const alexLogin = await request('POST', '/auth/login', {
      identifier: 'alex@connectly.edu',
      password: 'Password123!'
    });
    assert(alexLogin.status === 200 && alexLogin.data?.data?.token, 'Login as Alex (CS Student) successful with JWT');
    const alexToken = alexLogin.data?.data?.token;
    const alexId = alexLogin.data?.data?.user?._id;

    // 3. Login as Sarah
    const sarahLogin = await request('POST', '/auth/login', {
      identifier: 'sarah@connectly.edu',
      password: 'Password123!'
    });
    assert(sarahLogin.status === 200 && sarahLogin.data?.data?.token, 'Login as Sarah (HCI Student) successful');
    const sarahToken = sarahLogin.data?.data?.token;
    const sarahId = sarahLogin.data?.data?.user?._id;

    // 4. Login as Admin
    const adminLogin = await request('POST', '/auth/login', {
      identifier: 'admin@connectly.edu',
      password: 'AdminPass123!'
    });
    assert(adminLogin.status === 200 && adminLogin.data?.data?.user?.role === 'admin', 'Login as Admin Dean successful');
    const adminToken = adminLogin.data?.data?.token;

    // 5. Protected /auth/me
    const meRes = await request('GET', '/auth/me', null, alexToken);
    assert(meRes.status === 200 && meRes.data?.data?.user?.username === 'alexchen', 'GET /api/auth/me returns authenticated user details');

    // 6. Security: Invalid Token rejection
    const invalidTokenRes = await request('GET', '/auth/me', null, 'invalid_token_123');
    assert(invalidTokenRes.status === 401, 'Invalid JWT token rejected with 401 Unauthorized');

    // 7. Security: Unauthorized without token
    const noTokenRes = await request('GET', '/auth/me');
    assert(noTokenRes.status === 401, 'Request without token rejected with 401 Unauthorized');

    // 8. Register new user
    const randomUser = `student_${Date.now()}`;
    const registerRes = await request('POST', '/auth/register', {
      fullName: 'Test Student',
      username: randomUser,
      email: `${randomUser}@connectly.edu`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      department: 'Robotics Engineering'
    });
    assert(registerRes.status === 201 && registerRes.data?.data?.token, 'Registration of new student successful with JWT');

    // 9. Prevent duplicate registration
    const duplicateRes = await request('POST', '/auth/register', {
      fullName: 'Duplicate',
      username: randomUser,
      email: `${randomUser}@connectly.edu`,
      password: 'Password123!'
    });
    assert(duplicateRes.status === 409, 'Duplicate username/email registration rejected with 409 Conflict');

    // 10. Feed retrieval
    const feedRes = await request('GET', '/posts/feed', null, alexToken);
    assert(feedRes.status === 200 && Array.isArray(feedRes.data?.data), `Personalized feed returned ${feedRes.data?.data?.length} posts`);

    // 11. Create a Post
    const createPostRes = await request('POST', '/posts', {
      content: 'Automated test post for university project evaluation! #testing #antigravity'
    }, alexToken);
    assert(createPostRes.status === 201 && createPostRes.data?.data?.tags?.includes('testing'), 'Post creation with hashtag parsing successful');
    const testPostId = createPostRes.data?.data?._id;

    // 12. Like post (by Sarah)
    const likeRes = await request('POST', `/posts/${testPostId}/like`, null, sarahToken);
    assert(likeRes.status === 200 && likeRes.data?.data?.isLiked === true, 'Sarah liked Alex\'s post (atomic counter increment)');

    // 13. Add Comment (by Sarah)
    const commentRes = await request('POST', `/comments/post/${testPostId}`, {
      content: 'Awesome automated test verification!'
    }, sarahToken);
    assert(commentRes.status === 201 && commentRes.data?.data?.content, 'Sarah commented on post');
    const commentId = commentRes.data?.data?._id;

    // 14. Save Post (by Sarah)
    const saveRes = await request('POST', `/saved/${testPostId}`, null, sarahToken);
    assert(saveRes.status === 201 && saveRes.data?.data?.isSaved === true, 'Post saved to user bookmarks');

    // 15. Check Saved Posts list
    const getSavedRes = await request('GET', '/saved', null, sarahToken);
    assert(getSavedRes.status === 200 && getSavedRes.data?.data?.some(p => p._id === testPostId), 'Saved post appears in GET /api/saved');

    // 16. Follow user
    const followRes = await request('POST', `/follow/${alexId}`, null, sarahToken);
    // Might be 200 or 409 if already following from seed
    assert(followRes.status === 200 || followRes.status === 409, 'Follow interaction validated');

    // 17. Prevent self-follow
    const selfFollowRes = await request('POST', `/follow/${alexId}`, null, alexToken);
    assert(selfFollowRes.status === 400, 'Self-follow prevented with 400 Bad Request');

    // 18. Messaging / Conversations
    const convRes = await request('POST', '/messages/conversations', {
      recipientId: sarahId
    }, alexToken);
    assert(convRes.status === 200 && convRes.data?.data?._id, 'Conversation started or retrieved');
    const convId = convRes.data?.data?._id;

    // 19. Send message
    const msgRes = await request('POST', '/messages', {
      conversationId: convId,
      receiverId: sarahId,
      content: 'Hello Sarah from automated test suite!'
    }, alexToken);
    assert(msgRes.status === 201 && msgRes.data?.data?.content, 'Direct message sent and persisted');

    // 20. Check notifications for Alex (who received likes and comments)
    const notifRes = await request('GET', '/notifications', null, alexToken);
    assert(notifRes.status === 200 && Array.isArray(notifRes.data?.data), 'Notifications list retrieved successfully');

    // 21. Search users and posts
    const searchUserRes = await request('GET', '/users/search?q=sarah', null, alexToken);
    assert(searchUserRes.status === 200 && searchUserRes.data?.data?.length > 0, 'User search returned matching students');

    const exploreTagRes = await request('GET', '/posts/explore?tag=hackathon', null, alexToken);
    assert(exploreTagRes.status === 200 && exploreTagRes.data?.data?.length > 0, 'Explore filtered by hashtag #hackathon');

    // 22. Admin stats endpoint
    const adminStatsRes = await request('GET', '/admin/stats', null, adminToken);
    assert(adminStatsRes.status === 200 && adminStatsRes.data?.data?.stats?.totalUsers >= 10, 'Admin analytics dashboard data retrieved');

    // 23. Admin access control (Student trying to access admin route)
    const unauthorizedAdminRes = await request('GET', '/admin/stats', null, alexToken);
    assert(unauthorizedAdminRes.status === 403, 'Regular student blocked from /admin routes with 403 Forbidden');

    // Clean up created test comment and post
    await request('DELETE', `/comments/${commentId}`, null, sarahToken);
    await request('DELETE', `/posts/${testPostId}`, null, alexToken);

    console.log('========================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runVerification();
