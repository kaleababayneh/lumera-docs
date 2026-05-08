type ImageEntry = {
  width: number;
  height: number;
  url: string;
  verification?: { method: "keccak256(bytes)"; data: `0x${string}` };
};

type AvatarEntry = {
  hashFunction: "keccak256(bytes)";
  hash: `0x${string}`;
  url: string;
  fileType: string;
};

export type LSP3ProfileJSON = {
  LSP3Profile: {
    name: string;
    description: string;
    links: { title: string; url: string }[];
    tags: string[];
    profileImage: ImageEntry[];
    backgroundImage: ImageEntry[];
    avatar: AvatarEntry[];
  };
};

export function buildProfile(input: {
  name: string;
  description: string;
  links?: { title: string; url: string }[];
  tags?: string[];
  profileImage?: ImageEntry[];
  backgroundImage?: ImageEntry[];
  avatar?: AvatarEntry[];
}): LSP3ProfileJSON {
  return {
    LSP3Profile: {
      name: input.name,
      description: input.description,
      links: input.links ?? [],
      tags: input.tags?.length ? input.tags : ["lumera", "cascade"],
      profileImage: input.profileImage ?? [],
      backgroundImage: input.backgroundImage ?? [],
      avatar: input.avatar ?? [],
    },
  };
}

export function detectFileType(file: File): string {
  const ext = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext) return ext;
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return mime.slice("image/".length);
  if (mime.startsWith("model/")) return mime.slice("model/".length);
  return "bin";
}
