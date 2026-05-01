import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const showDownloadButton = false;

  return (
    className="relative min-h-screen bg-[#0a0f1c] text-white"

      {/* BACKGROUND GLOW EFFECT */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Invest Smart with{" "}
          <span className="text-emerald-400">Mexicatrading 🚀</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10"
        >
          Your trusted platform for secure and profitable investments. Grow your wealth with modern trading systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition border border-white/10"
          >
            Login
          </Link>

          {showDownloadButton && (
            <Link
              to="/download"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition border border-white/10"
            >
              Download
            </Link>
          )}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative py-24 px-6 text-center">

        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold mb-14"
        >
          Why Choose Us?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {[
            {
              icon: "🔒",
              title: "Secure",
              desc: "Bank-level encryption protects all your funds and data."
            },
            {
              icon: "⚡",
              title: "Profitable",
              desc: "Smart investment plans designed for consistent growth."
            },
            {
              icon: "🌍",
              title: "Global",
              desc: "Access your investments anywhere in the world."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:shadow-emerald-500/10 transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                {item.icon} {item.title}
              </h3>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Wealth?
          </h2>

          <p className="text-gray-300 mb-8">
            Join thousands of investors already growing their capital with us.
          </p>

          <Link
            to="/register"
            className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Get Started
          </Link>
        </motion.div>

      </section>

    </div>
  );
}
