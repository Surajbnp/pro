import { FaTelegram } from "react-icons/fa";
import { BiWorld } from "react-icons/bi";

const Arcade = () => {
  const games = [
    {
      id: 1,
      title: "Prime Boarder",
      description:
        "Prime Boarder is a Web3 endless boarder game that takes you through epic skate, surf, and snowboarding adventures.",
      imageUrl:
        "https://course-private-bucket.s3.ap-south-1.amazonaws.com/tg-bot/prime-boarder-main.jpg",
      webLink: "http://primeboarder.primearcade.io",
      tgLink: "https://t.me/Primemates_bot/PrimeBoarder",
      featured: true,
      tags: ["Featured", "Action", "Web3"],
    },
    {
      id: 2,
      title: "Skateboard Challenge",
      description:
        "Skateboard Challenge is a side-scrolling skate game where you shred the streets and dodge obstacles.",
      imageUrl:
        "https://course-private-bucket.s3.ap-south-1.amazonaws.com/tg-bot/skateChallenge.jpg",
      webLink: "https://pmbc.store/SkateboardChallenge/",
      tgLink: "https://t.me/Primemates_bot/SkateboardChallenge",
      tags: ["Sport", "Arcade"],
    },
    {
      id: 3,
      title: "Prime Pixel",
      description:
        "Prime Pixel is a pixel art platformer featuring a skateboarding ape with customizable outfits.",
      imageUrl:
        "https://course-private-bucket.s3.ap-south-1.amazonaws.com/tg-bot/skater-monkey.jpg",
      webLink: "http://skatermonkeyv2.netlify.app",
      tgLink: "https://t.me/Primemates_bot/PrimePixel",
      tags: ["Platformer", "Pixel Art"],
    },
    {
      id: 4,
      title: "Prime Mates Island",
      description:
        "Welcome to Prime Mates Island in the Spatial Metaverse! A vibrant tropical paradise with skateparks and surf zones.",
      imageUrl:
        "https://course-private-bucket.s3.ap-south-1.amazonaws.com/tg-bot/prime-island-spatial.jpg",
      webLink: "https://www.spatial.io/s/island-66c38f390300d9b2b814d2b3",
      tgLink: "https://t.me/Primemates_bot/Primeisland",
      tags: ["Metaverse", "Social"],
    },
  ];
  const featuredGame = games.find((game) => game.featured);
  const regularGames = games.filter((game) => !game.featured);

  return (
    <div className="relative">
      <div className="absolute inset-0 p-4 md:p-8">
        {featuredGame && (
          <div className="mb-12 opacity-0 animate-fadeIn">
            <div className="max-w-6xl mx-auto bg-zinc-900 rounded-2xl overflow-hidden">
              <div className="relative group">
                <img
                  src={featuredGame.imageUrl}
                  alt={featuredGame.title}
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 p-6 w-full">
                  <div className="flex gap-2 mb-3">
                    {featuredGame.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-[#fbc535] text-black text-sm font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {featuredGame.title}
                  </h2>
                  <p className="text-gray-200 mb-4">
                    {featuredGame.description}
                  </p>
                  <div className="flex gap-4">
                    <a
                      href={featuredGame.webLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-[#fbc535] text-black rounded-lg font-semibold transition-all duration-300 hover:bg-[#fbc535]/90 hover:-translate-y-1"
                    >
                      <BiWorld className="text-xl" />
                      Play on Web
                    </a>
                    <a
                      href={featuredGame.tgLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 border-2 border-[#fbc535] text-[#fbc535] rounded-lg font-semibold transition-all duration-300 hover:bg-[#fbc535]/10 hover:-translate-y-1"
                    >
                      <FaTelegram className="text-xl" />
                      Play on Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Regular Games Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {regularGames.map((game) => (
            <div
              key={game.id}
              className="bg-zinc-900 rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative group">
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  {game.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full bg-[#fbc535]/20 text-[#fbc535] text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                <div className="flex gap-3">
                  <a
                    href={game.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 bg-[#fbc535] text-black rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-[#fbc535]/90"
                  >
                    <BiWorld />
                    Web
                  </a>
                  <a
                    href={game.tgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 border border-[#fbc535] text-[#fbc535] rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-[#fbc535]/10"
                  >
                    <FaTelegram />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Arcade;
