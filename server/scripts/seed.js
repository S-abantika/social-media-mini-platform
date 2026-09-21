require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');
const Follow = require('../src/models/Follow');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');
const SavedPost = require('../src/models/SavedPost');

const sampleUsers = [
  {
    fullName: 'Alex Chen',
    username: 'alexchen',
    email: 'alex@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    bio: 'Junior CS Major @ Stanford. Passionate about Full-Stack Systems, distributed networks & open source 🚀',
    location: 'Silicon Valley Campus',
    department: 'Computer Science',
    website: 'https://github.com/alexchen-dev',
    role: 'user'
  },
  {
    fullName: 'Sarah Jenkins',
    username: 'sarah_j',
    email: 'sarah@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    bio: 'Human-Computer Interaction researcher. President of Campus UI/UX Design Guild 🎨',
    location: 'Design Building Studio 3',
    department: 'Design & HCI',
    website: 'https://sarahjenkins.design',
    role: 'user'
  },
  {
    fullName: 'Liam Davis',
    username: 'liam_robotics',
    email: 'liam@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Robotics Engineering senior. Building autonomous quadrupeds & embedded computer vision systems 🤖',
    location: 'Robotics Innovation Lab',
    department: 'Robotics Engineering',
    website: 'https://liamdavis.tech',
    role: 'user'
  },
  {
    fullName: 'Maya Patel',
    username: 'maya_ai',
    email: 'maya@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    bio: 'Machine Learning grad student. Researching neural representation & transformer attention mechanisms 🧠✨',
    location: 'AI Research Hall',
    department: 'Artificial Intelligence',
    website: 'https://mayapatel.ai',
    role: 'user'
  },
  {
    fullName: 'Jordan Taylor',
    username: 'jordan_biz',
    email: 'jordan@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    bio: 'Business & Entrepreneurship senior. Campus Venture Fund lead. Hosting the annual Startup Pitch Night 💼',
    location: 'Business School Tower',
    department: 'Business Administration',
    website: 'https://jordantaylor.ventures',
    role: 'user'
  },
  {
    fullName: 'Emily Zhang',
    username: 'emily_z',
    email: 'emily@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&auto=format&fit=crop&q=80',
    bio: 'Bioinformatics sophomore. Combining computational genomics with structural biology 🧬💻',
    location: 'Bio-X Research Complex',
    department: 'Bioinformatics',
    website: 'https://emilyzhang.bio',
    role: 'user'
  },
  {
    fullName: 'Marcus Johnson',
    username: 'marcus_j',
    email: 'marcus@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    bio: 'Cybersecurity & Ethical Hacking student. Lead of Campus Capture-The-Flag (CTF) Team 🛡️',
    location: 'Security Operations Lab',
    department: 'Cybersecurity',
    website: 'https://marcusctf.org',
    role: 'user'
  },
  {
    fullName: 'Chloe Dubois',
    username: 'chloe_d',
    email: 'chloe@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
    bio: 'Campus photographer & journalist for The Daily Campus. Capturing campus memories one shot at a time 📸',
    location: 'Student Union Hub',
    department: 'Journalism & Media',
    website: 'https://chloedubois.photo',
    role: 'user'
  },
  {
    fullName: 'Carlos Rodriguez',
    username: 'carlos_r',
    email: 'carlos@connectly.edu',
    password: 'Password123!',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
    bio: 'Electrical & Computer Engineering junior. Microcontrollers, FPGA synthesis & IoT hardware enthusiast ⚡',
    location: 'Hardware Engineering Wing',
    department: 'Electrical Engineering',
    website: 'https://carlosrodriguez.io',
    role: 'user'
  },
  {
    fullName: 'Dr. Evelyn Reed',
    username: 'admin',
    email: 'admin@connectly.edu',
    password: 'AdminPass123!',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    bio: 'Campus Platform Administrator & Faculty Dean. Welcome to Connectly! Please reach out for platform queries. 🎓🏛️',
    location: 'Administration Hall Suite 400',
    department: 'University Administration',
    website: 'https://connectly.edu/admin',
    role: 'admin'
  }
];

const samplePosts = [
  {
    authorUsername: 'alexchen',
    content: 'Excited to announce that our team took 1st place at HackCampus 2026! 🏆 We built an AI-driven peer tutoring network using React, Express, and WebSockets. Huge thanks to everyone who mentored and gave feedback during the 36-hour sprint! #hackathon #cs #coding #winner',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80',
    tags: ['hackathon', 'cs', 'coding', 'winner']
  },
  {
    authorUsername: 'sarah_j',
    content: 'Finished conducting usability tests for the new campus shuttle bus mobile application! 🚌📱 Key takeaway: Students want real-time GPS tracking with intuitive stop countdowns rather than static timetables. Working on the final Figma component library today. #uxdesign #campuslife #figma #hci',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&auto=format&fit=crop&q=80',
    tags: ['uxdesign', 'campuslife', 'figma', 'hci']
  },
  {
    authorUsername: 'liam_robotics',
    content: 'Field testing our autonomous quadruped robot today on the campus lawn! 🐕🤖 Achieving steady gait balance using dynamic inverse kinematics. Check out the sensor payload mounted on the chassis! #robotics #engineering #hardware #automation',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80',
    tags: ['robotics', 'engineering', 'hardware', 'automation']
  },
  {
    authorUsername: 'maya_ai',
    content: 'Just uploaded our new research paper preprint to arXiv: "Efficient Attention Mechanisms for Sparse Biological Graph Neural Networks"! 📄✨ Proud of our university research team for pushing the boundaries of AI in computational biology. #machinelearning #research #ai #genomics',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    tags: ['machinelearning', 'research', 'ai', 'genomics']
  },
  {
    authorUsername: 'jordan_biz',
    content: 'Campus Annual Venture Showcase is officially scheduled for next Friday at 6 PM! 🎙️💼 Over 12 student-founded startups will pitch in front of alumni angel investors. Free coffee, networking, and investor panels. Register at the business school lobby! #entrepreneurship #startups #networking',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=80',
    tags: ['entrepreneurship', 'startups', 'networking']
  },
  {
    authorUsername: 'emily_z',
    content: 'Late night analysis in the Bio-X computing cluster. Running sequence alignments across 10,000 bacterial genomes. Biology with Python and high-performance computing is truly magical! 🧬💻 #bioinformatics #science #python #gradlife',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80',
    tags: ['bioinformatics', 'science', 'python', 'gradlife']
  },
  {
    authorUsername: 'marcus_j',
    content: 'Our campus cybersecurity team just qualified for the National Cyber Defense Finals! 🛡️💻 48 hours of hardening Linux servers, analyzing network traffic, and deflecting simulated red-team attacks. Huge kudos to the whole crew! #cybersecurity #infosec #ctf #defense',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
    tags: ['cybersecurity', 'infosec', 'ctf', 'defense']
  },
  {
    authorUsername: 'chloe_d',
    content: 'Golden hour hitting the Memorial Quadrangle library arches this evening 🏛️🍂 Autumn on campus is unmatched. Swipe to see the perspective shots! #campusphoto #photography #autumn #collegelife',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80',
    tags: ['campusphoto', 'photography', 'autumn', 'collegelife']
  },
  {
    authorUsername: 'carlos_r',
    content: 'Assembled the custom 4-layer PCB for our smart campus air quality monitor! Soldering 0603 surface mount components under the microscope takes patience, but seeing the microcontroller blink alive is the best feeling. ⚡🔌 #hardware #electronics #pcb #iot',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    tags: ['hardware', 'electronics', 'pcb', 'iot']
  },
  {
    authorUsername: 'admin',
    content: 'Welcome to Connectly! 🎓 Official announcement: Midterm study lounges across the central library will remain open 24/7 beginning this Monday. Quiet zones, whiteboards, and charging stations are ready for all student study groups. Good luck with your preparations! #announcement #campus #academics',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
    tags: ['announcement', 'campus', 'academics']
  },
  {
    authorUsername: 'alexchen',
    content: 'Quick poll for software engineers: What state management library do you prefer in modern React for 2026? Context API + hooks, Zustand, or Redux Toolkit? Drop your pros and cons in the comments below! 👇 #react #webdev #frontend #javascript',
    image: '',
    tags: ['react', 'webdev', 'frontend', 'javascript']
  },
  {
    authorUsername: 'sarah_j',
    content: 'Design tip for fellow students building portfolio projects: Always design your typography scale using modular ratios (like Major Third 1.25 or Perfect Fourth 1.333). It creates an instant visual harmony that users immediately feel! ✨📐 #designtips #typography #ui',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
    tags: ['designtips', 'typography', 'ui']
  },
  {
    authorUsername: 'liam_robotics',
    content: 'Anyone interested in forming a team for the upcoming University Autonomous Drone Racing Challenge? We have flight controller boards, telemetry radios, and carbon fiber frames ready in the workshop! 🚁 #drones #robotics #engineering',
    image: '',
    tags: ['drones', 'robotics', 'engineering']
  },
  {
    authorUsername: 'maya_ai',
    content: 'Coffee and embeddings ☕ Looking over transformer attention heatmaps this morning. It is fascinating how multi-head attention naturally learns syntactic dependency relationships without explicit grammar training. #deeplearning #nlp #gradstudent',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
    tags: ['deeplearning', 'nlp', 'gradstudent']
  },
  {
    authorUsername: 'jordan_biz',
    content: 'Reminder: Resume drop deadline for the Fall Tech & Consulting Career Fair is tonight at 11:59 PM. Make sure your GitHub links, project summaries, and measurable impact metrics are up to date! 🚀📈 #careerfair #internships #college',
    image: '',
    tags: ['careerfair', 'internships', 'college']
  }
];

const sampleComments = [
  'Incredible work! Congratulations to the entire team!',
  'This is super impressive. Would love to read more about your tech stack.',
  'Great insights! Completely agree with this approach.',
  'Count me in! Where do we sign up?',
  'The aesthetics and user flow on this are phenomenal.',
  'Awesome project! Are you planning to release the source code on GitHub?',
  'Love seeing the campus innovation happening here.',
  'Solid recommendation, implemented this in our project last semester and it was a game changer.'
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connectly';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Follow.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      SavedPost.deleteMany({})
    ]);

    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users successfully.`);

    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.username] = u;
    });

    console.log('Establishing social follows...');
    let followCount = 0;
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = 0; j < createdUsers.length; j++) {
        // Follow a subset of other users (not self)
        if (i !== j && (i + j) % 2 === 0) {
          await Follow.create({
            follower: createdUsers[i]._id,
            following: createdUsers[j]._id
          });
          await User.findByIdAndUpdate(createdUsers[j]._id, { $inc: { followersCount: 1 } });
          await User.findByIdAndUpdate(createdUsers[i]._id, { $inc: { followingCount: 1 } });
          followCount++;
        }
      }
    }
    console.log(`Created ${followCount} follow relationships.`);

    console.log('Creating posts and interactions...');
    const createdPosts = [];
    for (const postData of samplePosts) {
      const author = userMap[postData.authorUsername] || createdUsers[0];

      // Assign random likes from other users
      const randomLikers = createdUsers
        .filter(u => u._id.toString() !== author._id.toString())
        .slice(0, Math.floor(Math.random() * 6) + 2)
        .map(u => u._id);

      const post = await Post.create({
        author: author._id,
        content: postData.content,
        image: postData.image,
        tags: postData.tags,
        likes: randomLikers,
        likesCount: randomLikers.length
      });

      await User.findByIdAndUpdate(author._id, { $inc: { postsCount: 1 } });
      createdPosts.push(post);

      // Create 1-3 comments for each post
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numComments; c++) {
        const commenter = createdUsers[(c + createdPosts.length) % createdUsers.length];
        const commentText = sampleComments[(c + createdPosts.length) % sampleComments.length];

        await Comment.create({
          post: post._id,
          author: commenter._id,
          content: commentText
        });
        await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
      }
    }
    console.log(`Created ${createdPosts.length} posts with comments and likes.`);

    console.log('Creating sample saved posts...');
    const alex = userMap['alexchen'];
    if (alex && createdPosts.length > 2) {
      await SavedPost.create({ user: alex._id, post: createdPosts[1]._id });
      await SavedPost.create({ user: alex._id, post: createdPosts[2]._id });
      await SavedPost.create({ user: alex._id, post: createdPosts[3]._id });
    }

    console.log('Creating sample conversations and messages...');
    const sarah = userMap['sarah_j'];
    const liam = userMap['liam_robotics'];
    const maya = userMap['maya_ai'];

    if (alex && sarah) {
      const conv1 = await Conversation.create({
        participants: [alex._id, sarah._id],
        lastMessage: {
          content: 'Hey Sarah! Loved your UI showcase post. Would love to collaborate on the campus shuttle app!',
          sender: alex._id,
          createdAt: new Date(Date.now() - 3600000),
          messageType: 'text'
        }
      });

      await Message.create({
        conversation: conv1._id,
        sender: sarah._id,
        receiver: alex._id,
        content: 'Hi Alex! Congrats on the HackCampus win! That tutoring app looked super crisp.',
        isRead: true,
        readAt: new Date(Date.now() - 7200000)
      });

      await Message.create({
        conversation: conv1._id,
        sender: alex._id,
        receiver: sarah._id,
        content: 'Hey Sarah! Loved your UI showcase post. Would love to collaborate on the campus shuttle app!',
        isRead: true,
        readAt: new Date(Date.now() - 3600000)
      });
    }

    if (alex && liam) {
      const conv2 = await Conversation.create({
        participants: [alex._id, liam._id],
        lastMessage: {
          content: 'Hey Liam, do you need another software developer for the drone racing team?',
          sender: alex._id,
          createdAt: new Date(Date.now() - 1800000),
          messageType: 'text'
        }
      });

      await Message.create({
        conversation: conv2._id,
        sender: alex._id,
        receiver: liam._id,
        content: 'Hey Liam, do you need another software developer for the drone racing team?',
        isRead: false
      });
    }

    console.log('Creating sample notifications...');
    if (alex && sarah && createdPosts.length > 0) {
      await Notification.create({
        recipient: alex._id,
        sender: sarah._id,
        type: 'like',
        post: createdPosts[0]._id,
        isRead: false
      });

      await Notification.create({
        recipient: alex._id,
        sender: liam._id,
        type: 'comment',
        post: createdPosts[0]._id,
        isRead: false
      });

      await Notification.create({
        recipient: alex._id,
        sender: maya._id,
        type: 'follow',
        isRead: true
      });
    }

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Credentials for Testing:');
    console.log(' 1. Student User 1: alex@connectly.edu / Password123!');
    console.log(' 2. Student User 2: sarah@connectly.edu / Password123!');
    console.log(' 3. Admin User:     admin@connectly.edu / AdminPass123!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
