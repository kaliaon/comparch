import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'courses_platform.settings')
django.setup()

if sys.stdout.encoding != 'utf-8':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

from courses.models import Course, Lesson, Test, Question, Choice, QuestionType

def add_example_course():
    print("Adding 'Компьютер архитектурасы' course...")
    
    course_name = "Компьютер архитектурасы"
    
    # Clean up old course if it exists
    Course.objects.filter(name=course_name).delete()
    # Also delete "Intro to Python" just in case
    Course.objects.filter(name="Intro to Python").delete()

    course = Course.objects.create(
        name=course_name,
        description="Компьютердің қалай жұмыс істейтінін, оның құрылымын және негізгі компоненттерін үйреніңіз."
    )
    
    # Lesson 1: Intro
    intro_lesson = Lesson.objects.create(
        course=course,
        title="Компьютерлік Архитектурасына Кіріспе",
        video_url="https://www.youtube.com/watch?v=AkFi90lZmXA",
        description="""
        <h3>КОМПЬЮТЕР АРХИТЕКТУРАСЫ ПӘНІНЕ КІРІСПЕ</h3>
        <p><strong>Компьютер архитектурасы</strong> — есептеу жүйесінің құрылымын, оның құрамдас бөліктерінің өзара байланысын және ақпаратты өңдеу қағидаттарын сипаттайтын ұғым. Компьютер архитектурасын зерттеу бағдарламалық және аппараттық деңгейлердің қалай өзара әрекеттесетінін түсінуге мүмкіндік береді.</p>
        
        <p>Компьютерлік жүйелер бірнеше деңгейден тұрады, олардың әрқайсысы белгілі бір қызмет атқарады және жалпы есептеу процесін қамтамасыз етеді. Бұл деңгейлердің үйлесімді жұмысы есептеу жүйесінің тиімділігі мен өнімділігін анықтайды.</p>

        <h3>Схема: «Көпдеңгейлі компьютер архитектурасы»</h3>
        <div class="schema-container">
            <div class="schema-level" data-tooltip="Instruction Set Architecture - интерфейс между ПО и оборудованием.">ISA (Деңгей 1)</div>
            <div class="arrow-down">↓</div>
            <div class="schema-level" data-tooltip="Процессордың ішкі құрылымы және орындалуы.">Микроархитектура (Деңгей 2)</div>
            <div class="arrow-down">↓</div>
            <div class="schema-level" data-tooltip="Логикалық элементтер мен схемалар (AND, OR, NOT).">Логикалық Деңгей (Деңгей 3)</div>
            <div class="arrow-down">↓</div>
            <div class="schema-level" data-tooltip="Электрондық компоненттер мен физикалық жүзеге асу.">Физикалық Деңгей (Деңгей 4)</div>
        </div>

        <p><strong>Анықтама:</strong> «Компьютер архитектурасы – есептеу жүйелерінің құрылымын және олардың жұмыс істеу қағидаттарын сипаттайтын көпдеңгейлі ұғым. Бұл пән компьютердің бағдарламалық және аппараттық бөліктерінің өзара байланысын түсінуге мүмкіндік береді.»</p>
        """
    )

    # Create Test for Lesson 1
    test = Test.objects.create(
        lesson=intro_lesson,
        title="Кіріспе Тест",
        description="Компьютерлік архитектура негіздері бойынша тест"
    )

    # Q1
    q1 = Question.objects.create(
        test=test,
        text="Компьютер архитектурасы дегеніміз не?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="Компьютер архитектурасы — бұл есептеу жүйесінің логикалық құрылымы мен жұмыс істеу негіздерін сипаттайтын пән."
    )
    Choice.objects.create(question=q1, text="Компьютердің тек сыртқы корпусы", is_correct=False)
    Choice.objects.create(question=q1, text="Есептеу жүйелерінің құрылымы мен жұмыс қағидаттарын сипаттайтын ұғым", is_correct=True)
    Choice.objects.create(question=q1, text="Интернет жылдамдығын өлшейтін құрал", is_correct=False)

    # Q2
    q2 = Question.objects.create(
        test=test,
        text="ISA (Instruction Set Architecture) қай жерде орналасқан?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="ISA — бағдарлама мен аппараттық бөлік арасындағы көпір (интерфейс) қызметін атқарады."
    )
    Choice.objects.create(question=q2, text="Тек жоғары деңгейлі бағдарламалау тілдерінде", is_correct=False)
    Choice.objects.create(question=q2, text="Микроархитектура мен Бағдарламалық қамтамасыз ету арасында", is_correct=True)
    Choice.objects.create(question=q2, text="Тек физикалық деңгейдегі транзисторларда", is_correct=False)
    Choice.objects.create(question=q2, text="Операциялық жүйенің ядросында", is_correct=False)

    print(f"Created test for {intro_lesson.title} with 2 questions.")

    # Lesson 2: ISA
    isa_lesson = Lesson.objects.create(
        course=course,
        title="Командалар Жүйесінің Архитектурасы (ISA)",
        video_url="https://www.youtube.com/watch?v=6fgbLOL7bis",
        description="""
        <h3>Командалар Жүйесінің Архитектурасы (ISA)</h3>
        <p>Командалар жүйесінің архитектурасы процессор орындай алатын командалар жиынтығын анықтайды. ISA бағдарламалық қамтамасыз ету мен аппараттық жүзеге асыру арасындағы негізгі интерфейс болып табылады.</p>
        
        <p>Әрбір команда белгілі бір құрылымға ие және процессордың ішкі блоктары арқылы кезең-кезеңімен орындалады. Командалардың орындалу тәртібі есептеу процесінің логикасын анықтайды.</p>

        <h3>Схема: «Команданың орындалу циклі»</h3>
        <p>Схема команданың процессорда қалай өңделетінін көрсетеді (таңдау, декодтау, орындау).</p>
        <div class="cycle-container">
            <div class="cycle-step">ТАҢДАУ</div>
            <div class="cycle-arrow">→</div>
            <div class="cycle-step">ДЕКОДТАУ</div>
            <div class="cycle-arrow">→</div>
            <div class="cycle-step">ОРЫНДАУ</div>
        </div>

        <h3>Интерактив: Инструкция құрылымы</h3>
        <p>Тышқанды апарып көріңіз:</p>
        <div class="interactive-instruction">
            <div class="instruction-part opcode" data-info="Opcode: Орындалатын операция (мысалы, ADD)">ADD</div>
            <div class="instruction-part operand" data-info="Operand: Деректер немесе адрестер (мысалы, R1, R2)">R1, R2</div>
        </div>

        <h3>Кесте: RISC және CISC архитектураларының салыстырмалы сипаттамасы</h3>
        <p>Кестеде командалар саны, күрделілік деңгейі және орындалу ерекшеліктері көрсетіледі.</p>
        <table>
            <thead>
                <tr>
                    <th>Ерекшелік</th>
                    <th>RISC (Reduced Instruction Set)</th>
                    <th>CISC (Complex Instruction Set)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Командалар саны</td>
                    <td>Аз және қарапайым</td>
                    <td>Көп және күрделі</td>
                </tr>
                <tr>
                    <td>Орындалу жылдамдығы</td>
                    <td>Бір циклде бір команда</td>
                    <td>Бір команда бірнеше цикл алуы мүмкін</td>
                </tr>
                <tr>
                    <td>Бағдарлама көлемі</td>
                    <td>Үлкенірек (көп қарапайым командалар)</td>
                    <td>Кішірек (күрделі командалар)</td>
                </tr>
            </tbody>
        </table>
        """
    )
    
    # Create Test for Lesson 2 (ISA)
    isa_test = Test.objects.create(
        lesson=isa_lesson,
        title="ISA Тест",
        description="Командалар жүйесі бойынша тест"
    )

    # Q1
    q1 = Question.objects.create(
        test=isa_test,
        text="ISA (Instruction Set Architecture) негізгі мақсаты не?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="ISA бағдарламалық кодтың процессорда қалай орындалатынын анықтайтын ережелер жиынтығын береді."
    )
    Choice.objects.create(question=q1, text="Бейнелерді өңдеу жылдамдығын арттыру", is_correct=False)
    Choice.objects.create(question=q1, text="Бағдарламалық жасақтама мен аппараттық құралдар арасындағы интерфейс болу", is_correct=True)
    Choice.objects.create(question=q1, text="Деректерді бұлтты серверде сақтау", is_correct=False)
    Choice.objects.create(question=q1, text="Пайдаланушы интерфейсін безендіру", is_correct=False)

    # Q2
    q2 = Question.objects.create(
        test=isa_test,
        text="Fetch-Decode-Execute циклінің 'Decode' кезеңінде не болады?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="Декодтау кезеңінде процессор алынған команданың мағынасын (кодты) түсінеді."
    )
    Choice.objects.create(question=q2, text="Нұсқаулық жадыдан (Memory) оқылады", is_correct=False)
    Choice.objects.create(question=q2, text="Нұсқаулық талданып, қандай операция екені анықталады", is_correct=True)
    Choice.objects.create(question=q2, text="Нәтижесі регистрлерде сақталады", is_correct=False)
    Choice.objects.create(question=q2, text="Операция тікелей ALU-да орындалады", is_correct=False)

    print(f"Created test for {isa_lesson.title} with 2 questions.")

    # Lesson 3: Microarchitecture
    micro_lesson = Lesson.objects.create(
        course=course,
        title="Процессордың Ұйымдастырылуы және Микроархитектурасы",
        video_url="https://www.youtube.com/watch?v=vgPFzblBh7w", # Updated Video URL
        description="""
        <h3>Процессордың Ұйымдастырылуы және Микроархитектурасы</h3>
        <p><strong>Процессор</strong> — есептеу жүйесінің негізгі элементі болып табылады. Ол командаларды орындау, деректерді өңдеу және басқару қызметтерін жүзеге асырады. Процессор бірнеше функционалдық блоктардан тұрады, олардың әрқайсысы нақты міндет атқарады.</p>
        
        <p>Процессор ішіндегі деректердің қозғалысы мен басқару сигналдары есептеу операцияларының дұрыс орындалуын қамтамасыз етеді.</p>

        <h3>Схема: «Процессордың құрылымдық сұлбасы»</h3>
        <p>Схема блоктардың өзара байланысын көрсетеді (арифметикалық-логикалық құрылғы, басқару блогы, регистрлер, деректер жолы).</p>
        
        <div class="proc-schema-container">
            <div class="proc-block proc-cu">БАСҚАРУ БЛОГЫ (Control Unit)</div>
            <div class="proc-arrow-down">↓</div>
            <div class="proc-block proc-regs">РЕГИСТРЛЕР</div>
            <div class="proc-block proc-alu">ALU</div>
            <div class="proc-arrow-down">↓</div>
            <div class="proc-block proc-bus">ДЕРЕКТЕР ЖОЛЫ (Data Path)</div>
        </div>
        """
    )
    
    # Optional: Add a simple test for Microarchitecture
    micro_test = Test.objects.create(
        lesson=micro_lesson,
        title="Микроархитектура Тест",
        description="Процессор құрылымы бойынша тест"
    )
    
    mq1 = Question.objects.create(
        test=micro_test,
        text="Процессордың негізгі қызметі қандай?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="Процессор — компьютердің 'миы', ол барлық негізгі есептеулер мен командаларды орындайды."
    )
    Choice.objects.create(question=mq1, text="Деректерді тек қағазға шығару", is_correct=False)
    Choice.objects.create(question=mq1, text="Командаларды орындау және деректерді өңдеу", is_correct=True)
    Choice.objects.create(question=mq1, text="Электр энергиясын жинақтап сақтау", is_correct=False)
    Choice.objects.create(question=mq1, text="Тек салқындату жүйесін реттеу", is_correct=False)

    mq2 = Question.objects.create(
        test=micro_test,
        text="Арифметикалық-логикалық құрылғы (ALU) не істейді?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="ALU барлық математикалық (қосу, азайту) және логикалық (салыстыру) амалдарға жауапты."
    )
    Choice.objects.create(question=mq2, text="Математикалық және логикалық амалдарды орындайды", is_correct=True)
    Choice.objects.create(question=mq2, text="Тек деректерді жадқа жібереді", is_correct=False)
    Choice.objects.create(question=mq2, text="Тек басқару сигналдарын таратады", is_correct=False)
    Choice.objects.create(question=mq2, text="Тек энергияны үнемдеумен айналысады", is_correct=False)

    print(f"Created test for {micro_lesson.title} with 2 questions.")

    # Lesson 4: Memory Hierarchy (Changed from Registers)
    mem_lesson = Lesson.objects.create(
        course=course,
        title="Жад Иерархиясы",
        video_url="https://www.youtube.com/watch?v=fpnE6UAfbtU",
        description="""
        <h3>Жад Иерархиясы</h3>
        <p>Жад иерархиясы деректерге қол жеткізу жылдамдығын арттыру және жүйенің өнімділігін жоғарылату мақсатында ұйымдастырылады. Жад деңгейлері жылдамдық, көлем және қолжетімділік сипаттамалары бойынша бір-бірінен ерекшеленеді.</p>
        
        <p>Жиі қолданылатын деректер процессорға жақын орналасқан жад деңгейлерінде сақталады, бұл есептеу уақытын қысқартуға мүмкіндік береді.</p>

        <h3>Диаграмма: «Жад иерархиясының пирамидасы»</h3>
        <p>Жылдамдық → (Жоғарыдан төмен қарай азаяды), Көлем → (Жоғарыдан төмен қарай өседі).</p>
        <div class="pyramid-container">
            <div class="pyr-arrow-up">
                <span class="pyr-label-speed">Жылдамдық ↑</span>
                <div class="pyr-arrow-line"></div>
            </div>
            <div class="pyramid-level pyr-1-regs">Регистрлер</div>
            <div class="pyramid-level pyr-2-cache">Кэш-жад (L1, L2, L3)</div>
            <div class="pyramid-level pyr-3-ram">Жедел жад (RAM)</div>
            <div class="pyramid-level pyr-4-storage">Сыртқы жад (HDD/SSD)</div>
        </div>

        <h3>Кесте: «Жад түрлерінің салыстырмалы сипаттамасы»</h3>
        <table>
            <thead>
                <tr>
                    <th>Жад түрі</th>
                    <th>Жылдамдық</th>
                    <th>Көлем</th>
                    <th>Қолжетімділік</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Регистрлер</strong></td>
                    <td>Ең жоғары</td>
                    <td>Ең аз (Биттер/Байттар)</td>
                    <td>Процессор ішінде</td>
                </tr>
                <tr>
                    <td><strong>Кэш-жад</strong></td>
                    <td>Өте жоғары</td>
                    <td>Аз (МБ)</td>
                    <td>Процессор/Чипсет</td>
                </tr>
                <tr>
                    <td><strong>RAM (Жедел жад)</strong></td>
                    <td>Орташа</td>
                    <td>Орташа (ГБ)</td>
                    <td>Аналық тақшада</td>
                </tr>
                <tr>
                    <td><strong>Сыртқы жад</strong></td>
                    <td>Төмен</td>
                    <td>Үлкен (ТБ/ПБ)</td>
                    <td>Дискілер, желі</td>
                </tr>
            </tbody>
        </table>
        """
    )

    mem_test = Test.objects.create(
        lesson=mem_lesson,
        title="Жад иерархиясы Тест",
        description="Жад жүйесін түсінуге арналған тест"
    )

    mq_mem1 = Question.objects.create(
        test=mem_test,
        text="Жад иерархиясындағы ең жылдам жад түрі қайсы?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="Регистрлер процессордың ішінде орналасқандықтан, оларға қол жеткізу уақыты ең аз."
    )
    Choice.objects.create(question=mq_mem1, text="HDD (Қатты диск)", is_correct=False)
    Choice.objects.create(question=mq_mem1, text="RAM (Жедел жад)", is_correct=False)
    Choice.objects.create(question=mq_mem1, text="Регистрлер", is_correct=True)
    Choice.objects.create(question=mq_mem1, text="L3 Кэш-жад", is_correct=False)

    mq_mem2 = Question.objects.create(
        test=mem_test,
        text="Жад иерархиясының негізгі мақсаты не?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="Иерархия арзан әрі үлкен жадты (HDD/SSD) жылдам әрі қымбат жадпен (Cache/Registers) теңестіру үшін қажет."
    )
    Choice.objects.create(question=mq_mem2, text="Компьютердің физикалық салмағын азайту", is_correct=False)
    Choice.objects.create(question=mq_mem2, text="Өнімділікті арттыру және жад құнын оңтайландыру", is_correct=True)
    Choice.objects.create(question=mq_mem2, text="Деректерді тек қауіпсіздік үшін көбейту", is_correct=False)
    Choice.objects.create(question=mq_mem2, text="Процессордың ядролар санын көбейту", is_correct=False)
    
    print(f"Created test for {mem_lesson.title} with 2 questions.")

    # Lesson 5: IO and Bus
    io_lesson = Lesson.objects.create(
        course=course,
        title="Енгізу-Шығару Құрылғылары және Жүйелік Шиналар",
        video_url="https://www.youtube.com/watch?v=alYwqzO6ZEQ", 
        description="""
        <h3>Енгізу-Шығару Құрылғылары және Жүйелік Шиналар</h3>
        
        <p>Процессор, жад және енгізу-шығару құрылғылары компьютерлік жүйеде бір-бірімен тікелей емес, жүйелік шиналар арқылы байланысады. Жүйелік шина — бұл деректерді, адрестерді және басқару сигналдарын тасымалдауға арналған ортақ байланыс арнасы.</p>

        <p>Процессор есептеулерді орындау барысында деректерді жадтан алады және өңделген нәтижелерді қайтадан жадқа немесе енгізу-шығару құрылғыларына жібереді. Бұл кезде процессор қажетті жад ұяшығының адресін адрестік шина арқылы жібереді. Жад құрылғысы осы адресті қабылдап, сәйкес деректерді деректер шинасы арқылы процессорға қайтарады.</p>

        <p>Енгізу-шығару құрылғылары да жүйелік шиналарға қосылған. Олар деректерді енгізу немесе шығару кезінде процессормен және жадпен өзара әрекеттеседі. Процессор басқару шинасы арқылы енгізу-шығару құрылғыларына қандай операция орындалатынын хабарлайды, ал деректер шинасы нақты ақпаратты тасымалдауға қолданылады.</p>

        <p>Осылайша, жүйелік шиналар процессор, жад және енгізу-шығару құрылғылары арасындағы үйлесімді жұмысты қамтамасыз етеді. Барлық деректер алмасу біртұтас байланыс жүйесі арқылы жүзеге асып, компьютерлік жүйенің тұрақты әрі тиімді жұмыс істеуіне мүмкіндік береді.</p>
        """
    )
    
    io_test = Test.objects.create(
        lesson=io_lesson,
        title="I/O және Шиналар Тест",
        description="Енгізу-шығару жүйесі бойынша тест"
    )

    mq_io1 = Question.objects.create(
        test=io_test,
        text="Жүйелік шинаның қызметі қандай?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="Жүйелік шина — бұл компьютердің барлық бөліктерін байланыстыратын ақпараттық 'жол'."
    )
    Choice.objects.create(question=mq_io1, text="Деректерді жою және тазарту", is_correct=False)
    Choice.objects.create(question=mq_io1, text="Компоненттер (CPU, RAM, I/O) арасында ақпарат алмасу", is_correct=True)
    Choice.objects.create(question=mq_io1, text="Тек салқындатқыш желдеткішті басқару", is_correct=False)
    Choice.objects.create(question=mq_io1, text="Тек дыбыс деңгейін реттеу", is_correct=False)

    mq_io2 = Question.objects.create(
        test=io_test,
        text="Төмендегілердің қайсысы енгізу құрылғысына жатады?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="Пернетақта пайдаланушыдан ақпаратты компьютерге енгізу үшін қолданылады."
    )
    Choice.objects.create(question=mq_io2, text="Пернетақта (Keyboard)", is_correct=True)
    Choice.objects.create(question=mq_io2, text="Монитор (Шығару құрылғысы)", is_correct=False)
    Choice.objects.create(question=mq_io2, text="Процессор (Өңдеу құрылғысы)", is_correct=False)
    Choice.objects.create(question=mq_io2, text="Кэш-жад (Сақтау құрылғысы)", is_correct=False)

    print(f"Created test for {io_lesson.title} with 2 questions.")

    # Lesson 6: Parallel Processing
    par_lesson = Lesson.objects.create(
        course=course,
        title="Параллель Өңдеу және Өнімділік",
        video_url="https://www.youtube.com/watch?v=6kEGUCrBEU0",
        description="""
        <h3>Параллель Өңдеу және Өнімділік</h3>
        <p>Параллель өңдеу — есептеу жүйесінде бірнеше операцияны бір уақыт аралығында орындау тәсілі. Бұл әдіс процессордың есептеу ресурстарын тиімді пайдалануға мүмкіндік береді және бағдарламалардың орындалу уақытын қысқартады.</p>
        <p>Параллель өңдеу процессордың ішкі құрылымына және есептеулерді ұйымдастыру тәсіліне байланысты жүзеге асырылады. Қазіргі компьютерлік жүйелерде параллель өңдеудің негізгі түрлері ретінде конвейерлеу және көпядролы архитектура қолданылады.</p>

        <h3>Конвейерлеу (Pipeline execution)</h3>
        <p>Конвейерлеу — командаларды орындау процесін бірнеше кезеңге бөліп, оларды бір уақытта, бірақ әртүрлі сатыларда орындау тәсілі. Әрбір кезең өзіне тиесілі операцияны орындайды, ал командалар конвейер арқылы кезең-кезеңімен жылжып отырады.</p>

        <h4>Схема: Конвейерлік орындау кезеңдері</h4>
        <div class="pipeline-container">
            <div class="pipeline-row">
                <div class="pipeline-label">1-Команда</div>
                <div class="pipe-stage st-fetch">Fet</div>
                <div class="pipe-stage st-decode">Dec</div>
                <div class="pipe-stage st-execute">Exe</div>
                <div class="pipe-stage st-mem">Mem</div>
                <div class="pipe-stage st-write">WB</div>
            </div>
            <div class="pipeline-row">
                <div class="pipeline-label">2-Команда</div>
                <div class="pipe-stage st-empty"></div>
                <div class="pipe-stage st-fetch">Fet</div>
                <div class="pipe-stage st-decode">Dec</div>
                <div class="pipe-stage st-execute">Exe</div>
                <div class="pipe-stage st-mem">Mem</div>
                <div class="pipe-stage st-write">WB</div>
            </div>
            <div class="pipeline-row">
                <div class="pipeline-label">3-Команда</div>
                <div class="pipe-stage st-empty"></div>
                <div class="pipe-stage st-empty"></div>
                <div class="pipe-stage st-fetch">Fet</div>
                <div class="pipe-stage st-decode">Dec</div>
                <div class="pipe-stage st-execute">Exe</div>
                <div class="pipe-stage st-mem">Mem</div>
                <div class="pipe-stage st-write">WB</div>
            </div>
             <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">(Fet=Fetch, Dec=Decode, Exe=Execute, Mem=Access, WB=WriteBack)</p>
        </div>
        
        <h3>Көпядролы архитектура (Multicore architecture)</h3>
        <p>Көпядролы архитектурада бір процессордың құрамында бірнеше есептеу ядросы болады. Әр ядро командаларды тәуелсіз түрде орындай алады, бұл бір мезгілде бірнеше есептеу ағынын іске асыруға мүмкіндік береді.</p>
        
        <h4>Схема: Көпядролы процессордың құрылымы</h4>
         <div class="multicore-container">
            <div class="core-box">Core 1</div>
            <div class="core-box">Core 2</div>
            <div class="core-box">Core 3</div>
            <div class="core-box">Core 4</div>
            <div class="shared-cache">Ортақ КЭШ-жад (L3 Cache)</div>
        </div>
        """
    )

    par_test = Test.objects.create(
        lesson=par_lesson,
        title="Параллель өңдеу Тест",
        description="Параллель өңдеу және конвейер бойынша тест"
    )

    mq_par1 = Question.objects.create(
        test=par_test,
        text="Параллель өңдеудің негізгі артықшылығы неде?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=1,
        explanation="Бір уақытта бірнеше команда орындау арқылы жалпы жұмыс уақыты қысқарады."
    )
    Choice.objects.create(question=mq_par1, text="Компьютердің физикалық өлшемін үлкейту", is_correct=False)
    Choice.objects.create(question=mq_par1, text="Өнімділікті арттыру және орындалу уақытын үнемдеу", is_correct=True)
    Choice.objects.create(question=mq_par1, text="Бағдарлама қателерін автоматты түрде жою", is_correct=False)
    Choice.objects.create(question=mq_par1, text="Жадтағы деректерді қысу", is_correct=False)
    
    mq_par2 = Question.objects.create(
        test=par_test,
        text="Конвейерлеу (Pipelining) дегеніміз не?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        points=1,
        order=2,
        explanation="Конвейерлеу — бұл әртүрлі командалардың кезеңдерін қатар орындау арқылы процессорды бос тұрғызбау тәсілі."
    )
    Choice.objects.create(question=mq_par2, text="Деректерді жою процесі", is_correct=False)
    Choice.objects.create(question=mq_par2, text="Командаларды кезең-кезеңмен қатар орындау", is_correct=True)
    Choice.objects.create(question=mq_par2, text="Интернетке қосылу", is_correct=False)

    print(f"Created test for {par_lesson.title} with 2 questions.")

    lessons_data = [] # No more placeholder lessons needed for now

    for lesson in lessons_data:
        Lesson.objects.create(
            course=course,
            title=lesson["title"],
            video_url=lesson["video_url"],
            description=lesson["description"]
        )
    
    print(f"Successfully added course: {course.name} with {len(lessons_data) + 4} lessons.")

if __name__ == "__main__":
    add_example_course()
