import React from "react";
import { motion } from "framer-motion";

const LOGOS = [
  { name: "Google", text: "Google" },
  { name: "Microsoft", text: "Microsoft" },
  { name: "Netflix", text: "Netflix" },
  { name: "Airbnb", text: "Airbnb" },
  { name: "Samsung", text: "Samsung" },
  { name: "Volkswagen", text: "Volkswagen" },
  { name: "Nasdaq", text: "Nasdaq" },
  { name: "Box", text: "Box" },
];

const TrustStrip = () => (
  <div className="border-y border-gray-200 py-5 mb-10">
    <p className="text-center text-[12px] font-semibold text-gray-400 uppercase tracking-widest mb-5">
      Trusted by employees at top companies worldwide
    </p>
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {LOGOS.map(({ name, text }, i) => (
        <motion.span
          key={name}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="text-[18px] font-black text-gray-300 hover:text-gray-500 transition-colors cursor-default tracking-tight select-none"
        >
          {text}
        </motion.span>
      ))}
    </div>
  </div>
);

export default TrustStrip;

