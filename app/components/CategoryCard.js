import {
    Box,
    AspectRatio,
    AbsoluteCenter,
    Image
} from '@/providers'
import { useState } from 'react';

export default function CategoryCard({ imageUrl, catName, categoryClick }) {
    const [isCategoryHovered, setIsCategoryHovered] = useState(false);

    return (
        <Box
            position="relative"
            onMouseEnter={() => setIsCategoryHovered(true)}
            onMouseLeave={() => setIsCategoryHovered(false)}
        >
            <AspectRatio ratio={4 / 3} overflow='hidden' rounded="3xl">
                <Image
                    src={imageUrl}
                    alt={catName}
                    loading="lazy"
                    transition="transform 0.2s"
                    transform={`scale(${isCategoryHovered ? 1.2 : 1})`} 
                />
            </AspectRatio>
            <Box
                position="absolute"
                top={0}
                height="100%"
                width="100%"
                bg="linear-gradient(to bottom, rgba(255,255,255, 0) 0%, rgba(0,0,0, 1) 155%)"
                rounded="3xl"
                cursor='pointer'
                onClick={categoryClick}
            />
            <AbsoluteCenter
                color='white'
                axis='horizontal'
                bottom={6}
                fontWeight='bold'
                fontSize={isCategoryHovered ? '3xl' : '2xl'}
                transition='font-size 0.2s'
                width='100%'
                textAlign='center'
            >
                {catName}
            </AbsoluteCenter>
        </Box>
    )
}