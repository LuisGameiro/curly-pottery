import React, { FC } from "react";
import { Container } from "@components/ui";
import { Text } from "@components/ui";

import s from "./Hero.module.css";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
interface HeroProps {
  className?: string;
  headline: string;
  description: string;
}

const Hero: FC<HeroProps> = ({ headline, description }) => {
  return (
    <div className="bg-secondary border-b border-t border-border">
      <Container>
        <div className={s.root}>
          <Text className={s.title} variant="heading">
            {headline}
          </Text>
          <div className={s.description}>
            <Text variant="body">{description}</Text>
            <Link
              href="/about"
              className="flex items-center pt-3 font-bold hover:underline cursor-pointer w-max-content content-center"
            >
              Read it here
              <ArrowRight width="20" heigh="20" className="ml-1" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
