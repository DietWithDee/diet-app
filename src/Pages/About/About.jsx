import React from 'react';
import LOGO from '../../assets/LOGO.webp';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 55, damping: 16 },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

const scaleBar = {
  hidden: { scaleX: 0, originX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stats = [
  { value: '500+', label: 'Clients Supported' },
  { value: '5+', label: 'Years of Practice' },
  { value: '10+', label: 'Community Outreaches' },
];

function AboutUsSection() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="About DietWithDee | Nana Ama Dwamena, Your Favourite Dietitian"
        description="Learn about DietWithDee, founded by Nana Ama Dwamena, a registered dietitian in Ghana. Discover our mission to make expert nutrition accessible to all."
        keywords="About DietWithDee, Nana Ama Dwamena, Registered Dietitian, Ghana, Nutrition, Wellness"
        image="/LOGO.webp"
        url="/about"
        ogType="article"
        lang="en"
      />

      {/* ── Hero / Our Story ─────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden">
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 max-w-4xl">
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Heading */}
            <div className="space-y-3">
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 leading-tight"
              >
                Our Story
              </motion.h1>
              <motion.div
                variants={scaleBar}
                className="w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              />
            </div>

            {/* Body copy */}
            <motion.div
              variants={fadeUp}
              className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed"
            >
              <p>
                In Ghana, access to professional nutrition advice is often limited, and many people
                struggle with health conditions that could be better managed with the right support.{' '}
                <span className="font-semibold italic text-green-700">DietWithDee</span> was born
                to bridge that gap.
              </p>

              <p>
                Founded by{' '}
                <span className="font-semibold italic text-green-700">
                  Registered Dietitian Nana&nbsp;Ama&nbsp;Dwamena
                </span>
                , this initiative makes expert diet consultations more accessible —&nbsp;especially
                for Ghanaians who may not have easy access to in-person services.
              </p>

              <p>
                <span className="font-semibold italic text-green-700">DietWithDee</span> brings
                nutrition guidance right to your phone, your home, and your everyday life.
              </p>

              <p>
                While our journey began with the goal of supporting Ghanaians, our vision is
                global. DietWithDee is for anyone, anywhere, who wants practical, culturally aware,
                and evidence-based nutrition support. We believe that food is deeply personal, and
                nutrition should be too. That&rsquo;s why we&rsquo;re committed to helping people
                eat better, feel stronger, and thrive — no matter where they are in the world.
              </p>

              <p>
                Here, we don&rsquo;t just give advice — we walk the journey with you, one simple
                and sustainable change at a time.
              </p>
            </motion.div>

            {/* Pull-quote */}
            <motion.blockquote
              variants={fadeUp}
              className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl px-6 py-5 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-green-200 rounded-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
              <p className="text-base sm:text-lg font-semibold italic text-green-800 relative z-10">
                &ldquo;Our vision is to be a top online platform that transforms how people view
                nutrition and wellness.&rdquo;
              </p>
            </motion.blockquote>

            {/* CTA */}
            <motion.div variants={fadeUp} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/my-journey')}
                className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-700 hover:to-emerald-700"
                aria-label="Start your nutrition transformation journey"
              >
                Start My Transformation
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-600 py-12">
        <div className="container mx-auto px-5 sm:px-8 max-w-4xl">
          <motion.div
            className="grid grid-cols-3 gap-4 text-center text-white"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black">{value}</p>
                <p className="text-xs sm:text-sm font-medium opacity-85 leading-snug">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Community & Impact ───────────────────────────────────── */}
      <section id="community-impact" className="py-20 bg-white">
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 max-w-4xl">
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Heading */}
            <div className="space-y-3">
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600"
              >
                Community &amp; Impact
              </motion.h2>
              <motion.div
                variants={scaleBar}
                className="w-16 h-1.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              />
            </div>

            {/* Body copy */}
            <motion.div
              variants={fadeUp}
              className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed"
            >
              <p>
                Beyond individual consultations, we believe in the power of collective change.{' '}
                <span className="font-semibold italic text-green-700">DietWithDee</span> is
                actively involved in community programs, health outreaches, and educational
                initiatives across Ghana.
              </p>
              <p>
                Our mission is to take nutrition education out of the clinic and into the heart of
                communities — from schools and religious organisations to corporate spaces — making
                health guidance practical, inclusive, and fun.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/services#events-gallery')}
                className="group inline-flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-bold hover:bg-green-700 hover:text-white transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                <span>Explore our Outreach Events</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Logo Sign-off ─────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-t from-green-50 to-white flex flex-col items-center gap-6">
        <motion.div
          className="relative p-6 max-w-xs w-full"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-[1.02] transition-transform duration-500">
            <img
              src={LOGO}
              alt="DietWithDee Logo"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
          >
            Expert Care
          </motion.div>
        </motion.div>

        <p className="text-gray-500 font-medium italic text-sm sm:text-base">
          &mdash; Your Journey to a Healthier You &mdash;
        </p>
      </section>
    </>
  );
}

export default AboutUsSection;
