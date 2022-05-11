import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Challenge, ChallengeI18n } from '../../../models/Challenge';
import { Lang } from '../../../models/Lang';
import { NCCommonService } from '../../../services/ncCommon.service';
import { NCHService } from '../../../services/nch.service';
import { ChallengeLanguagesForm } from './ChallengeLanguagesForm';

interface ChallengeLanguagesProps {
    challenge: Challenge;
}

export const ChallengeLanguages: React.FunctionComponent<ChallengeLanguagesProps> = (props:ChallengeLanguagesProps) => {
    const [ langs, setLangs ] = useState<Array<Lang>>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ challengeLangs, setChallengeLangs ] = useState<Array<ChallengeI18n>>([]);

    useEffect(() => {
        getLangList();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (langs) {
            getChallengeLangs();
        }
    }, [ props.challenge.id, langs ]);

    const getLangList = async () => {
        const data = await NCCommonService.getLangs();
        setLangs(data);
    };

    const getChallengeLangs = () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const tempArr = [];
        for (const i in props.challenge.languages) {
            tempArr.push({ ...props.challenge.languages[i], lang: i, id: props.challenge.id });
        }
        setChallengeLangs(tempArr);
        setIsLoading(false);
    };

    const saveChallengeI18n = async (tls: Array<ChallengeI18n>) => {
        const tempObj = {};
        for (const tl of tls) {
            if (tl.lang) {
                tempObj[tl.lang] = tl;
            }
        }
        try {
            await NCHService.updateChallengeI18n(
                props.challenge.id,
                { ...props.challenge.languages, ...tempObj },
            );
            toast.success('Rule updated');
        } catch (e) {
            console.error('error updating', e);
        }
    };

    if (isLoading) {
        return <></>;
    }

    return (
        <ChallengeLanguagesForm
            langs={langs}
            challengeId={props.challenge.id}
            challengeLangs={challengeLangs}
            saveHook={(c) => {
                if (c) {
                    saveChallengeI18n(c);
                }
            }}
        ></ChallengeLanguagesForm>
    );
};
