import Link from "next/link";
import Image, { ImageProps } from "next/image";
import { Category } from "@lib/types/types";

interface Props {
  className?: string;
  cat: Category;
  noNameTag?: boolean;
  imgProps?: Omit<ImageProps, "src" | "layout" | "placeholder" | "blurDataURL">;
  admin?: boolean;
}

const placeholderImg = "/product-img-placeholder.svg";

const CategoriesCard = ({ cat, imgProps, admin }: Props) => {
  if (!cat) return null;

  return (
    <Link
      href={
        admin
          ? `/admin/categories/${cat?.slug}`
          : `/shop/category?=${cat?.name}`
      }
      aria-label={cat?.name}
      className="relative block h-full w-full overflow-hidden"
    >
      {cat.image && (
        <Image
          quality="100"
          src={cat.image || placeholderImg}
          alt={cat.name || "Product Image"}
          height={320}
          width={320}
          {...imgProps}
        />
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <h1 className=" bg-accent-3/60 text-2xl px-5 py-1 text-center text-on-primary">
          {cat.name}
        </h1>
      </div>
    </Link>
  );
};

export default CategoriesCard;
