import axios from 'axios';

export class S3LoaderService {
    private static baseUrl: string = String(
        process.env.REACT_APP_S3_LOADER_URL,
    );
    private static publicUrl: string = String(process.env.REACT_APP_S3_PUBLIC_URL);

    static encodeFileToBase64 = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event: any) =>
                resolve(event.target.result.toString());
            reader.readAsDataURL(file);
        });
    };

    static uploadChallengeMedia = async (
        ntId: string,
        lang: string,
        type: string,
        image: string,
    ): Promise<string | undefined> => {
        if (!ntId || !lang || !type || !image) {
            return undefined;
        }

        try {
            await axios.post(
                `${S3LoaderService.baseUrl}/nt/challenges/${ntId}/i18n/${lang}/medias/${type}`,
                {
                    data: image,
                },
                {
                    headers: {
                        'x-access-token': localStorage.getItem('accessToken'),
                    },
                },
            );
        } catch {
            return undefined;
        }
        return `${S3LoaderService.publicUrl}/nt/challenges/${ntId}/i18n/${lang}/medias/${type}`;
    };
}
