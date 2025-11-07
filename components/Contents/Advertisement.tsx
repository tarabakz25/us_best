import { useState } from 'react';

interface AdvertisementProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export const Advertisemen({ id, title, description, imageUrl, linkUrl }: AdvertisementProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <>

    </>
  )
}
