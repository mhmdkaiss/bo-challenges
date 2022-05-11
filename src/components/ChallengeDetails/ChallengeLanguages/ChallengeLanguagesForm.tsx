import {
    ButtonTheme,
    ButtonType,
    NCActions,
    NCDialog,
    NCFlagSelector,
    NCInput,
    NCLoader,
    NCMediaUpload,
    NCMultiMediaUpload,
    NCPromotionalBanner
} from '@cactus/srm-component';
import React, { useEffect, useState } from 'react';
import { ChallengeI18n } from '../../../models/Challenge';
import { Lang } from '../../../models/Lang';
import { S3LoaderService } from '../../../services/s3Loader.service';

interface ChallengeLanguagesProps {
    langs: Array<Lang>;
    challengeId: string;
    challengeLangs: Array<ChallengeI18n>;
    saveHook: (languages?: Array<ChallengeI18n>) => void;
}

interface LangsMaps {
    [key: string]: ChallengeI18n;
}

enum Fields {
    Title = 0,
    Description = 1,
    PromoBannerButton = 2,
    PromoBannerLink = 3,
    PromoBannerText = 4,
}

export const ChallengeLanguagesForm: React.FunctionComponent<ChallengeLanguagesProps> = (props: ChallengeLanguagesProps) => {
    const publicS3Url = process.env.REACT_APP_S3_PUBLIC_URL || '';
    const [ selectedLang, setSelectedLang ] = useState<string>('en');
    const [ languageMedias, setLanguageMedias ] = useState<Array<any>>([]);
    const [ langsModified, setLangsModified ] = useState<LangsMaps>({});

    const [ challengeLang, setChallengeLang ] = useState<ChallengeI18n>({ title: '' });

    const [ loading, setLoading ] = useState<boolean>(true);
    const [ previewBanner, setPreviewBanner ] = useState<boolean>(false);

    const setImages = ( logo?: string, banner?: string, open?: string ) => {
        setLanguageMedias([
            {
                typeImg: 'Logo',
                labelImg: 'Logo',
                currentImg: logo,
                defaultImg: '',
                zoneSize: 'small',
            },
            {
                typeImg: 'Banner',
                labelImg: 'Banner',
                currentImg: banner,
                defaultImg: '',
                zoneSize: 'medium',
                noClick: true,
                mediaLibrary: true,
            },
            {
                typeImg: 'Opengraph',
                labelImg: 'Opengraph',
                currentImg: open,
                defaultImg: '',
                zoneSize: 'small',
                noClick: true,
                mediaLibrary: true,
            },
        ]);
    };

    useEffect(() => {
        if (props.challengeLangs) {
            const challLang = props.challengeLangs.find((c) => c.lang === selectedLang);
            const editable = langsModified[selectedLang] || challLang;
            if (editable) {
                setChallengeLang(
                    { id: editable.id,
                        lang: editable.lang,
                        title: editable.title,
                        description: editable.description,
                        logo: editable.logo,
                        banner: editable.banner,
                        banner_og: editable.banner_og,
                        banner_promo: editable.banner_promo,
                        banner_promo_button: editable.banner_promo_button,
                        banner_promo_link: editable.banner_promo_link,
                        banner_promo_text: editable.banner_promo_text,
                    }
                );
            } else {
                setChallengeLang({ id: props.challengeId,
                    lang: selectedLang || 'en',
                    title: '',
                    description: '',
                    logo: '',
                    banner: '',
                    banner_og: '',
                    banner_promo: '',
                    banner_promo_button: '',
                    banner_promo_link: '',
                    banner_promo_text: '',
                });
            }
        }
        setLoading(false);
    }, [ langsModified, selectedLang, props.challengeLangs ]);

    useEffect(() => {
        setImages(
            challengeLang.logo,
            challengeLang.banner,
            challengeLang.banner_og,
        );
    }, [challengeLang]);

    function challengeLangsChange(r: ChallengeI18n) {
        setChallengeLang(r);
        const _p = { ...langsModified };
        _p[selectedLang] = r;
        setLangsModified({ ..._p });
    }

    function setChange(key: string, text: string = '') {
        let _p;
        switch (key) {
            case Fields[0] :
                _p = { ...challengeLang, title: text };
                break;
            case Fields[1] :
                _p = { ...challengeLang, description: text };
                break;
            case Fields[2] :
                _p = { ...challengeLang, banner_promo_button: text };
                break;
            case Fields[3] :
                _p = { ...challengeLang, banner_promo_link: text };
                break;
            default :
                _p = { ...challengeLang, banner_promo_text: text };
        }
        challengeLangsChange(_p);
    }

    async function mediaChange(type: string, ctx: string, image: string) {
        const _p = { ...challengeLang };
        const _img =
            ctx === 'blob'
                ? await S3LoaderService.uploadChallengeMedia(
                    props.challengeId,
                    selectedLang,
                    type,
                    image,
                )
                : image;
        if (!_img) {
            return;
        }

        switch (type) {
            case 'Logo':
                _p.logo = _img;
                break;
            case 'Banner':
                _p.banner = _img;
                break;
            case 'Opengraph':
                _p.banner_og = _img;
                break;
            case 'Promotional':
                _p.banner_promo = _img;
                break;
            default:
                break;
        }
        challengeLangsChange(_p);
    }

    if (loading) {
        return <div className="text-center my-4">
            <NCLoader />
        </div>;
    }

    return (
        <React.Fragment>
            <div className={'nc-card nc-challenge-languages'}>
                <div className={'row'}>
                    <div className={'col-12 mb-4'}>
                        <NCFlagSelector
                            languages={props.langs}
                            actionHook={setSelectedLang}
                            publicUrl={publicS3Url}
                        ></NCFlagSelector>
                    </div>
                    <div className={'col-12 mb-4'}>
                        <NCInput
                            id={'title-' + selectedLang}
                            key={'title-' + selectedLang}
                            label="Title"
                            value={challengeLang.title}
                            onChange={(c) => setChange(Fields[0], c)}
                            type={'text'}
                        />
                    </div>
                    <div className={'col-12 mb-4'}>
                        <NCInput
                            id={'description-' + selectedLang}
                            key={'description-' + selectedLang}
                            label="Description"
                            value={challengeLang.description? challengeLang.description : ''}
                            onChange={(c) => setChange(Fields[1], c)}
                            type={'text'}
                        />
                    </div>
                    <div className={'col-12 mb-4'}>
                        <NCMultiMediaUpload
                            images={languageMedias}
                            actionHook={(
                                type: string,
                                ctx: string,
                                image: string,
                            ) => {
                                mediaChange(type, ctx, image);
                            }}
                            s3PublicUrl={publicS3Url}
                        />
                    </div>
                    <div className={'col-4 mb-4'}>
                        <NCMediaUpload
                            mediaLibrary
                            currentImg={challengeLang.banner_promo}
                            actionHook={(ctx, file) => {
                                mediaChange('Promotional', ctx, file);
                            }}
                            s3PublicUrl={publicS3Url}
                        />
                    </div>
                    <div className={'col-8 mb-4 row'}>
                        <div className={'col-12 mb-4'}>
                            <NCInput
                                id={'banner-promo-text-' + selectedLang}
                                key={'banner-promo-text-' + selectedLang}
                                label="Promotional banner description"
                                value={challengeLang.banner_promo_text ? challengeLang.banner_promo_text : '' }
                                onChange={(c) => setChange(Fields[4], c)}
                                type={'text'}
                            />
                        </div>
                        <div
                            className={'col-12 mb-4 d-flex'}
                            style={{
                                gap: '3rem'
                            }}
                        >
                            <NCInput
                                id={'banner-promo-link-' + selectedLang}
                                key={'banner-promo-link-' + selectedLang}
                                label="Call to action button"
                                value={challengeLang.banner_promo_link ? challengeLang.banner_promo_link : ''}
                                onChange={(c) => setChange(Fields[3], c)}
                                type={'text'}
                            />
                            <NCInput
                                id={'banner-promo-button-' + selectedLang}
                                key={'banner-promo-button-' + selectedLang}
                                label="Button label"
                                value={challengeLang.banner_promo_button ? challengeLang.banner_promo_button : ''}
                                onChange={(c) => setChange(Fields[2], c)}
                                type={'text'}
                            />
                        </div>
                        <NCDialog show={previewBanner} setShow={setPreviewBanner} title={'Promotional Banner Preview'}>
                            <NCPromotionalBanner
                                text={[challengeLang.banner_promo_text ? challengeLang.banner_promo_text : '']}
                                image={challengeLang.banner_promo ? challengeLang.banner_promo : ''}
                                buttonText={challengeLang.banner_promo_button}
                            />
                        </NCDialog>
                    </div>
                    <div className={'col-12 mb-4'}>
                        <NCActions
                            actions={[
                                {
                                    label: 'save',
                                    theme: ButtonTheme.CLASSIC,
                                    setClick: () => {
                                        props.saveHook(Object.values(langsModified));
                                    },
                                },
                                {
                                    label: 'Preview Promotional Banner',
                                    theme: ButtonTheme.CLASSIC,
                                    type: ButtonType.TEXT,
                                    setClick: () => {
                                        setPreviewBanner(true);
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
