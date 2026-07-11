
import asyncio

from repo.therapists import TherapistRepo
from .dependencies import db_session


therapist_ids = {
    55521433 : "ZhenyaZen",
130896033 : "ronnie_n",
133704756 : "unimind_psy",
141774237 : "nataliavladykina",
158877989 : "metacbt",
186326091 : "irinaushkova",
221597459 : "namvladimir",
234775768 : "alyonapronina16",
275317055 : "psy_star",
319801677 : "olgapukemova",
351433370 : "svetlanabazilev",
371880847 : "mmbpsy",
509550451 : "lubapsy",
532162497 : "katiaternovaya",
543744943 : "eduardnelepko",
636217421 : "Psychologist_Daria",
705915703 : "muv3101",
737110754 : "Veronica_SVF",
874688732 : "numariiina",
1269041050 : "elvira_ism",
}




async def main():
    session = await db_session()
    repo = TherapistRepo(session=session)
    for id, username in therapist_ids.items():
        await repo.update_username(tg_id=id, username=username)
        
    await session.close()

asyncio.run(main())