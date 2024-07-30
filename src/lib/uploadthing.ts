import { UTApi } from "uploadthing/server";
 
export const utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET!,
});


const IMAGE_TYPES = ['image/png', 'image/jpeg'];
const VIDEO_TYPES = ['video/mp4'];
const FILE_SIZES = {
    image: 1024 * 1024 * 4,
    video: 1024 * 1024 * 16
}

export async function fileUpload(files: File[]) {
    const validate = files.every((file) => {
        return (IMAGE_TYPES.includes(file.type) && file.size <= FILE_SIZES.image) ||
            (VIDEO_TYPES.includes(file.type) && file.size <= FILE_SIZES.video);
    });

    if (!validate) {
        return null;
    }

    console.log(validate)
    
    const response = await utapi.uploadFiles(files!);

    console.log(response);

    console.log(files)

    return response;
}