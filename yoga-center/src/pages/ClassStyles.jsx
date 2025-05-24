const classStyles = [
  {
    name: "Ashtanga Yoga",
    title: "For the Dedicated Spirit",
    image: "/classes/ashtanga.jpg",
    icon: "/classes/ashtanga-pose.png",
    about:
      "Imagine a beautiful, rhythmic dance with your breath as your partner. That's Ashtanga. It's a traditional, pretty rigorous practice where we move through a specific sequence of poses, linking each one with our breath. It's challenging, yes, but incredibly rewarding because you truly build your practice pose by pose.",
    why: "You'll build incredible strength, stamina, and a deep, flexible body. More than that, it sharpens your mind, boosts your focus, and gives you a powerful sense of discipline. Think of it as a moving meditation that purifies both body and spirit.",
    perfect:
      "Someone who loves a structured challenge, enjoys mastering a sequence, and is ready to commit to a practice that truly transforms you, inside and out. (Some yoga experience is a good idea for this one!)",
  },
  {
    name: "Vinyasa Yoga",
    title: "Go with the Flow",
    image: "/classes/vinyasa.jpg",
    about:
      "Vinyasa is all about movement flowing seamlessly with your breath. Think of it like a creative dance – one pose melts into the next, guided by your inhales and exhales. Every Vinyasa class is a little different, keeping things fresh and exciting, so you'll never get bored!",
    why: "It's fantastic for building strength, improving your balance, and getting your heart rate up in a mindful way. You'll feel more fluid in your body, and that continuous movement helps melt away stress, leaving you feeling calm and clear.",
    perfect:
      "Looking for a dynamic, ever-changing practice that keeps you engaged. It's great if you love to move, find your rhythm, and enjoy a lively class. Everyone's welcome here!",
    icon: "/classes/warrior1.png",
  },
  {
    name: "Power Yoga",
    title: "Ignite Your Inner Fire",
    image: "/classes/power.jpg",
    icon: "/classes/power-plank.png",
    about:
      "Get ready to sweat and feel empowered! Power Yoga takes the principles of Ashtanga and supercharges them. It's a vigorous, athletic class designed to push your limits, build serious strength, and leave you feeling incredibly accomplished. Expect a faster pace and a full-body workout.",
    why: "It's an amazing way to burn calories, tone your muscles, and build incredible core strength. It's also a fantastic stress reliever – you'll literally sweat out tension!",
    perfect:
      "Ready for a strong, high-energy workout. If you're an athlete, love to challenge yourself, or just want to build serious strength and stamina, this class is for you.",
  },
  {
    name: "Hatha Yoga",
    title: "Your Gentle Foundation",
    image: "/classes/hatha.jpg",
    about:
      "Hatha is like the wise, grounding elder of yoga styles. We focus on holding fundamental yoga poses for a few breaths, taking our time to really understand the alignment and feel the stretch. It's a slower, more deliberate pace, perfect for truly connecting with your body and breath.",
    why: "It's wonderful for building a solid foundation in yoga, improving your flexibility, and finding your balance. You'll also discover a deep sense of relaxation, reduce stress, and improve your posture. It's a fantastic way to slow down and truly be present.",
    perfect:
      "Just starting your yoga journey, prefer a calm and gentle pace, or want to really dive deep into understanding how each pose works in your body. It's a welcoming space for all.",
  },
  {
    name: "Yoga for Weight Loss",
    title: "Mindful Movement, Healthy You",
    image: "/classes/weightloss.jpg",
    about:
      "This isn't just about burning calories (though we do that!). This class combines dynamic Vinyasa and Power Yoga elements with sequences designed to get your heart pumping, build lean muscle, and kickstart your metabolism. But more importantly, we focus on cultivating mindfulness – helping you connect with your body's true needs and build healthier habits off the mat.",
    why: "You'll build strength, increase your endurance, improve digestion, and reduce stress (which, let's be honest, can sometimes contribute to weight gain!). It's a holistic approach to feeling good in your skin.",
    perfect:
      "Looking for an active and energizing yoga practice that supports your wellness journey, helps you manage stress, and empowers you to make healthier choices for your body.",
  },
  {
    name: "Advanced Yoga",
    title: "Elevate Your Practice",
    image: "/classes/advanced.jpg",
    about:
      "Ready to reach new heights on your mat? Our Advanced Yoga classes are for seasoned yogis looking to explore complex inversions (hello, handstands!), intricate arm balances, deep backbends, and hold poses for longer. It's about refining your technique, pushing your boundaries safely, and discovering new capabilities within yourself.",
    why: "You'll build extraordinary strength, balance, and flexibility, mastering poses you once thought impossible. Beyond the physical, it deepens your mental focus and helps you access profound states of presence.",
    perfect:
      "An experienced yogi with a consistent practice who has a solid foundation in the basics and intermediate poses. If you're eager for a significant physical and mental challenge and want to take your practice to the next level, we'd love to have you. (Psst! If you're not sure if you're ready, just chat with one of our instructors – we're here to guide you!)",
  },
];

const ClassStyles = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-4xl font-bold mb-6 text-center">
      Our Yoga Class Styles: Find Your Perfect Flow
    </h1>
    <p className="text-lg mb-10 text-center max-w-2xl mx-auto">
      Ready to discover the magic of yoga? At Ravi Yoga Center, we believe
      there's a yoga style for every body and every mood. Whether you're craving
      a powerful sweat, a gentle stretch, or a moment of calm, we've got a class
      that'll feel just right. Come on in, let's find your flow!
    </p>
    <div className="grid gap-8 md:grid-cols-2">
      {classStyles.map((style) => (
        <div
          key={style.name}
          className="bg-white rounded-lg shadow p-0 overflow-hidden flex flex-col"
        >
          {style.icon ? (
            <img
              src={style.icon}
              alt={style.name + " icon"}
              className="w-24 h-24 object-contain mx-auto mt-6"
            />
          ) : (
            <img
              src={style.image}
              alt={style.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">
              {style.name}{" "}
              <span className="text-green-600">— {style.title}</span>
            </h2>
            <p className="mb-2">
              <span className="font-semibold">What it is:</span> {style.about}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Why you'll love it:</span>{" "}
              {style.why}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Perfect if you're:</span>{" "}
              {style.perfect}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ClassStyles;
