import { motion } from "framer-motion"
import clsx from "clsx"

interface StaggeredFadeInProps {
  renderText: string,
  renderTime: number
}

export default function StaggeredFade(props: StaggeredFadeInProps) {
  const sentence = props.renderText
  const wordVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * props.renderTime },
    }),
  }
  const words = sentence.split(" ")
  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      className={clsx(
        "text-center font-display font-bold drop-shadow-sm",
        "text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
        "tracking-[-0.02em]",
        "md:leading-[4rem] lg:leading-[4.5rem] xl:leading-[5rem]"
      )}
    >
      {words.map((word, i) => (
        <motion.span key={word} variants={wordVariants} custom={i}>
          {word}{" "}
        </motion.span>
      ))}
    </motion.h1>
  )
}