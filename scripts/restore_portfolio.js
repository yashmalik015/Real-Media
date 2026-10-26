import 'dotenv/config'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb+srv://yashmalik015_db_user:TIHJvglnODWAHuah@cluster0.dqhp8cg.mongodb.net/assetsweber?retryWrites=true&w=majority&appName=Cluster0'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('assetsweber')
  const col = db.collection('portfolio_items')

  const items = [
    {
      id: 'portfolio_0f898238a1003c8625cd50cb',
      title: 'Film on Iphone',
      service: 'Video Editing',
      description: 'Shot and edited on iPhone with cinematic grading and sound design.',
      client: 'Mobile Creators',
      outcome: 'Viral Reel',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1792649471/assetsweber/portfolio/videos/mx1npshre7pyw2hwnyup.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1792649471/assetsweber/portfolio/videos/mx1npshre7pyw2hwnyup.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1792649471/assetsweber/portfolio/videos/mx1npshre7pyw2hwnyup.jpg',
    },
    {
      id: 'portfolio_1e3232f25e6e93177fff4254',
      title: 'Day 14 Batman Files',
      service: 'Video Editing',
      description: 'Dramatic daily vlog series featuring custom VFX and motion transitions.',
      client: 'Batman Files',
      outcome: 'Audience Engagement',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786261433/assetsweber/portfolio/videos/akcqtfoiqa7mn3acn4rt.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786261433/assetsweber/portfolio/videos/akcqtfoiqa7mn3acn4rt.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786261433/assetsweber/portfolio/videos/akcqtfoiqa7mn3acn4rt.jpg',
    },
    {
      id: 'portfolio_55b7974d41498ef0c31ab2c2',
      title: 'Primary Logo',
      service: 'Graphic Design',
      description: 'Corporate brand mark and visual identity system.',
      client: 'Campus Adda',
      outcome: 'Brand Launch',
      mediaType: 'image',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_1920,c_limit/v1786261398/assetsweber/portfolio/graphic-design/e6jsccxlzrp08yf9dayp.png',
      videoUrl: '',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_720,c_limit/v1786261399/assetsweber/portfolio/thumbnails/ujrputnxlo2uvezrqow2.png',
    },
    {
      id: 'portfolio_585b411e35fdba9eb29f20b2',
      title: 'Campus Adda Secondary Logo / Alternate Logo',
      service: 'Graphic Design',
      description: 'Versatile responsive brand marks for dark and light UI applications.',
      client: 'Campus Adda',
      outcome: 'Design Kit',
      mediaType: 'image',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_1920,c_limit/v1786261279/assetsweber/portfolio/graphic-design/zcldc8agtef4scc90lx4.png',
      videoUrl: '',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_720,c_limit/v1786261280/assetsweber/portfolio/thumbnails/rracnjksa4qlojk9xyrm.png',
    },
    {
      id: 'portfolio_d3a1c77ac01c91838724769f',
      title: 'Campus Adda Logo',
      service: 'Graphic Design',
      description: 'Signature emblem crafted with modern geometric typography.',
      client: 'Campus Adda',
      outcome: 'Official Identity',
      mediaType: 'image',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_1920,c_limit/v1786261058/assetsweber/portfolio/graphic-design/fwb1y2qo7s2urzvqmjhy.png',
      videoUrl: '',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/image/upload/f_auto,q_auto,w_720,c_limit/v1786261059/assetsweber/portfolio/thumbnails/i6hsie0gegfhils51sa5.png',
    },
    {
      id: 'portfolio_847a865e853a2e2e76ba26cd',
      title: 'Gaming Videos Editing',
      service: 'Video Editing',
      description: 'High-energy montage with beat sync, camera shakes, and dynamic sound effects.',
      client: 'Xgenius Gamer',
      outcome: 'Esports Content',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786260660/assetsweber/portfolio/videos/zwncfj5fhh6bqu3xdqzj.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786260660/assetsweber/portfolio/videos/zwncfj5fhh6bqu3xdqzj.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786260660/assetsweber/portfolio/videos/zwncfj5fhh6bqu3xdqzj.jpg',
    },
    {
      id: 'portfolio_1fd8b0932bf2aa20c46d55d4',
      title: 'Mine Official Intro Upcoming Psychological Web Series',
      service: 'Video Editing',
      description: 'Atmospheric opening sequence with suspense pacing and sound design.',
      client: 'Film Studio',
      outcome: 'Title Sequence',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786260564/assetsweber/portfolio/videos/lpscbmveqjmv3k5tpeum.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786260564/assetsweber/portfolio/videos/lpscbmveqjmv3k5tpeum.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786260564/assetsweber/portfolio/videos/lpscbmveqjmv3k5tpeum.jpg',
    },
    {
      id: 'portfolio_69d17576a72a225c3b2a5b16',
      title: 'Dr Sabrina Seminar Marketing',
      service: 'Video Editing',
      description: 'High-conversion marketing trailer for medical keynote webinar.',
      client: 'Dr Sabrina',
      outcome: 'Seminar Sales',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259766/assetsweber/portfolio/videos/onrs3bkhw2h9fi5egq5q.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259766/assetsweber/portfolio/videos/onrs3bkhw2h9fi5egq5q.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786259766/assetsweber/portfolio/videos/onrs3bkhw2h9fi5egq5q.jpg',
    },
    {
      id: 'portfolio_5758d27158b33ca0d7055058',
      title: 'Online Scam Horror Short Film',
      service: 'Video Editing',
      description: 'Cinematic cyber thriller short exploring psychological horror of social engineering.',
      client: 'Indie Film',
      outcome: 'Short Film Festival',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259621/assetsweber/portfolio/videos/alatu4c9zsncxzbfcbfu.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259621/assetsweber/portfolio/videos/alatu4c9zsncxzbfcbfu.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786259621/assetsweber/portfolio/videos/alatu4c9zsncxzbfcbfu.jpg',
    },
    {
      id: 'portfolio_18e62fb5dad8bd105cb5797e',
      title: 'Mine Ep - 1 Teaser',
      service: 'Video Editing',
      description: 'Episode 1 teaser trailer with dramatic dialogue cuts and cinematic color grading.',
      client: 'Series Producers',
      outcome: 'Audience Buzz',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259468/assetsweber/portfolio/videos/g2atculj6uhqs3dad0mz.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259468/assetsweber/portfolio/videos/g2atculj6uhqs3dad0mz.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786259468/assetsweber/portfolio/videos/g2atculj6uhqs3dad0mz.jpg',
    },
    {
      id: 'portfolio_9d18d49f807d014003df534d',
      title: 'MINE First Look',
      service: 'Video Editing',
      description: 'Exclusive first look teaser showcasing visual style and character introduction.',
      client: 'Series Producers',
      outcome: 'Social Hype',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259273/assetsweber/portfolio/videos/ubxgsqgamok2euhezc1c.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259273/assetsweber/portfolio/videos/ubxgsqgamok2euhezc1c.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786259273/assetsweber/portfolio/videos/ubxgsqgamok2euhezc1c.jpg',
    },
    {
      id: 'portfolio_6e094ee1da489bf9f5f4f8f4',
      title: 'GYM EDIT',
      service: 'Video Editing',
      description: 'Motivational fitness reel with speed ramping, motion blur, and bass-heavy audio sync.',
      client: 'Fitness Brand',
      outcome: 'High Retention',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259080/assetsweber/portfolio/videos/rqhelttvc5a1smtx2zog.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786259080/assetsweber/portfolio/videos/rqhelttvc5a1smtx2zog.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786259080/assetsweber/portfolio/videos/rqhelttvc5a1smtx2zog.jpg',
    },
    {
      id: 'portfolio_2de75ed25eff5d1a35154c7b',
      title: 'Talk head video edit',
      service: 'Video Editing',
      description: 'Talking head video with engaging b-roll cutaways, dynamic captions, and sound effects.',
      client: 'Creator',
      outcome: 'View Duration',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258957/assetsweber/portfolio/videos/zcwb0mojwo3jcuzxskpo.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258957/assetsweber/portfolio/videos/zcwb0mojwo3jcuzxskpo.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786258957/assetsweber/portfolio/videos/zcwb0mojwo3jcuzxskpo.jpg',
    },
    {
      id: 'portfolio_226fbfe9b62c2435407bc929',
      title: 'Batman Files Day - 4',
      service: 'Video Editing',
      description: 'Vlog cut with fast transitions, punchy sound design, and color grading.',
      client: 'Batman Files',
      outcome: 'Viral Reach',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258904/assetsweber/portfolio/videos/n8e7uadpwb2d75hex39j.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258904/assetsweber/portfolio/videos/n8e7uadpwb2d75hex39j.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786258904/assetsweber/portfolio/videos/n8e7uadpwb2d75hex39j.jpg',
    },
    {
      id: 'portfolio_66119d9df14f25fd842228f8',
      title: 'A Day in My Life',
      service: 'Video Editing',
      description: 'Lifestyle vlog documenting daily routine with smooth aesthetic color palette.',
      client: 'Yash Real',
      outcome: 'Branding',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258575/assetsweber/portfolio/videos/tlst8kraoj92yjwdlwvj.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786258575/assetsweber/portfolio/videos/tlst8kraoj92yjwdlwvj.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786258575/assetsweber/portfolio/videos/tlst8kraoj92yjwdlwvj.jpg',
    },
    {
      id: 'portfolio_463a820580caa8843765d51d',
      title: 'What B.tech Students do other than study',
      service: 'Video Editing',
      description: 'Comedy lifestyle vlog with humorous edits, sound memes, and pacing.',
      client: 'Student Creators',
      outcome: '50k views',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786256928/assetsweber/portfolio/videos/qbdx3ms6lgqzavopgb4c.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786256928/assetsweber/portfolio/videos/qbdx3ms6lgqzavopgb4c.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786256928/assetsweber/portfolio/videos/qbdx3ms6lgqzavopgb4c.jpg',
    },
    {
      id: 'portfolio_8d8ab708f7b9d84b0d831c1e',
      title: 'Day - 55 Batman Files',
      service: 'Video Editing',
      description: 'Vlog cut with fast transitions, punchy sound design, and color grading.',
      client: 'Batman Files',
      outcome: 'Branding',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786256835/assetsweber/portfolio/videos/cdt2fwid46amnualxwda.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786256835/assetsweber/portfolio/videos/cdt2fwid46amnualxwda.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786256835/assetsweber/portfolio/videos/cdt2fwid46amnualxwda.jpg',
    },
    {
      id: 'portfolio_98993f075263bbc3065ad2f7',
      title: 'UI Animation Portfolio',
      service: 'Video Editing',
      description: 'A modern collection of smooth, interactive UI animations designed to enhance user experience.',
      client: 'Assets Weber',
      outcome: 'Website Reveal',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786255934/assetsweber/portfolio/videos/qq609cnsbibzrlncuqjm.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786255934/assetsweber/portfolio/videos/qq609cnsbibzrlncuqjm.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786255934/assetsweber/portfolio/videos/qq609cnsbibzrlncuqjm.jpg',
    },
    {
      id: 'portfolio_03354fd36641d285aa1e95c8',
      title: 'Batman Files Intro Day - 0',
      service: 'Video Editing',
      description: 'Opening episode teaser with cinematic color grade and punchy sound design.',
      client: 'Batman Files',
      outcome: 'Building Client Identity',
      mediaType: 'video',
      mediaUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786255896/assetsweber/portfolio/videos/m0ms0t02hwfiiwpeiltu.mp4',
      videoUrl: 'https://res.cloudinary.com/ulkupo3g/video/upload/f_auto,q_auto,w_1280,c_limit/v1786255896/assetsweber/portfolio/videos/m0ms0t02hwfiiwpeiltu.mp4',
      thumbnail: 'https://res.cloudinary.com/ulkupo3g/video/upload/so_0,w_720,c_limit/v1786255896/assetsweber/portfolio/videos/m0ms0t02hwfiiwpeiltu.jpg',
    }
  ]

  for (const it of items) {
    await col.updateOne(
      { id: it.id },
      {
        $set: {
          title: it.title,
          service: it.service,
          description: it.description,
          client: it.client,
          outcome: it.outcome,
          category: it.service,
          media_type: it.mediaType,
          media_url: it.mediaUrl,
          video_url: it.videoUrl,
          thumbnail: it.thumbnail,
          updated_at: new Date().toISOString()
        }
      }
    )
    console.log('✓ Restored and optimized:', it.title)
  }

  await client.close()
  console.log('ALL PORTFOLIO ITEMS 100% RESTORED WITH HIGH-DEF POSTERS AND OPTIMIZED CLOUDINARY STREAMS!')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
