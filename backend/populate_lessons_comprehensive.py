#!/usr/bin/env python
"""
Comprehensive script to populate the database with lesson data, including detailed quiz structures
and correct answers for open-ended questions.

This script should be run from the project root directory using:
python populate_lessons_comprehensive.py

It replaces all other population scripts with a single consolidated solution.
"""

import os
import django
import random
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'courses_platform.settings')
django.setup()

from courses.models import Course, Lesson, Test, Question, Choice, QuestionType
from django.db import connection

def create_quiz_questions(title, subject, num_questions=3):
    """Create natural quiz questions for a lesson with correct answers for open-ended questions."""
    questions = []
    
    # Define realistic questions based on the subject
    realistic_questions = {
        "Үлестірілген мәліметтер жүйелеріне кіріспе": [
                "correct_answer": "Үлестірілген жүйелердің негізгі сипаттамалары: 1) Ресурстарды бөлісу; 2) Ашықтық; 3) Параллелизм; 4) Масштабталу; 5) Қатеге төзімділік; 6) Қауіпсіздік. Бұл сипаттамалар үлестірілген жүйелердің тиімді және сенімді жұмыс істеуін қамтамасыз етеді.",
                "explanation": "Үлестірілген жүйелер көптеген дербес компьютерлердің бір тұтас жүйе ретінде жұмыс істеуіне негізделген."
            },
            {
                "text": "Клиент-сервер архитектурасы дегеніміз не және оның негізгі компоненттерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Клиент-сервер архитектурасы - бұл сервер мен клиент компьютерлері арасындағы міндеттерді бөлуге негізделген желілік архитектура. Негізгі компоненттері: 1) Сервер - қызметтерді ұсынатын және ресурстарды басқаратын компьютер; 2) Клиент - сервер қызметтерін пайдаланатын компьютер; 3) Желі - клиенттер мен серверлерді байланыстыратын инфрақұрылым."
            },
                "explanation": "Үлестірілген есептеулер жүйенің сенімділігі мен кеңею мүмкіндігін қамтамасыз етеді."
            },
            {
                "text": "Үлестірілген жүйелердің қандай кемшіліктері бар?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Жоғары жылдамдық пен өнімділік",
                        "is_correct": False
                    },
                    {
                        "text": "Күрделілік, қауіпсіздік мәселелері және желіге тәуелділік",
                        "is_correct": True
                    },
                    {
                        "text": "Деректерді кэштеу және сақтау",
                        "is_correct": False
                    },
                    {
                        "text": "Ақпаратты бөлек жинау және кестелеу",
                        "is_correct": False
                    }
                ]
            }
        ],
        "Үлкен деректер массивтерін өңдеу және талдау технологиялары": [
            {
                "text": "Үлкен деректердің 3V қасиеттерін түсіндіріңіз.",
                "type": "open_ended",
                "correct_answer": "Үлкен деректердің 3V қасиеттері: 1) Volume (Көлем) - үлкен көлемдегі деректер; 2) Velocity (Жылдамдық) - деректердің жоғары жылдамдықпен өндірілуі және өңделуі; 3) Variety (Әртүрлілік) - құрылымдалған, жартылай құрылымдалған және құрылымдалмаған деректердің алуан түрлі форматтары."
            },
            {
                "text": "Hadoop фреймворкінің негізгі компоненттерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Hadoop фреймворкінің негізгі компоненттері: 1) HDFS (Hadoop Distributed File System) - деректерді үлестірілген сақтау жүйесі; 2) MapReduce - үлкен деректерді параллельді өңдеу үшін бағдарламалау моделі; 3) YARN (Yet Another Resource Negotiator) - ресурстарды басқару платформасы; 4) Hadoop Common - басқа Hadoop модульдеріне ортақ утилиталар."
            },
            {
                "text": "MapReduce парадигмасының негізгі кезеңдері қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Құру, өңдеу және визуализациялау",
                        "is_correct": False
                    },
                    {
                        "text": "Map, Shuffle және Reduce",
                        "is_correct": True
                    },
                    {
                        "text": "Жүктеу, талдау және сақтау",
                        "is_correct": False
                    },
                    {
                        "text": "Құрылымдау, тазалау және түрлендіру",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "Hadoop және Apache Spark арасындағы негізгі айырмашылық қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Оларда архитектуралық айырмашылықтар жоқ",
                        "is_correct": False
                    },
                    {
                        "text": "Hadoop тек жадыда өңдеуді қолданады, ал Spark диск арқылы жұмыс істейді",
                        "is_correct": False
                    },
                    {
                        "text": "Spark тек құрылымдалған деректермен жұмыс істейді, ал Hadoop тек құрылымдалмаған деректермен",
                        "is_correct": False
                    },
                    {
                        "text": "Spark жадыда өңдеуді қолданады, ал Hadoop диск арқылы жұмыс істейді",
                        "is_correct": True
                    }
                ]
            }
        ],
        "Үлестірілген жүйелердің архитектурасы": [
            {
                "text": "Үлестірілген жүйе архитектурасын жобалау кезінде ескерілетін факторларды атаңыз.",
                "type": "open_ended",
                "correct_answer": "Үлестірілген жүйе архитектурасын жобалау кезінде ескерілетін факторлар: 1) Масштабталу - жүйенің өсуіне дайын болу; 2) Қолжетімділік - жүйе компоненттерінің істен шыққан жағдайда жұмыс істеуді жалғастыру қабілеті; 3) Өнімділік - төмен кідіріс пен жоғары өткізу қабілеті; 4) Қауіпсіздік - аутентификация, авторизация, шифрлау; 5) Үйлесімділік - әртүрлі технологиялармен жұмыс істеу мүмкіндігі; 6) Басқарылатындық - мониторинг, журналдау және конфигурация."
            },
            {
                "text": "Үлестірілген жүйе архитектурасының негізгі түрлерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Үлестірілген жүйе архитектурасының негізгі түрлері: 1) Клиент-сервер архитектурасы - клиенттер серверлерге сұраныс жібереді және жауап алады; 2) Peer-to-peer (P2P) архитектурасы - барлық түйіндер тең құқылы және ресурстарды бөліседі; 3) Үш деңгейлі архитектура - презентация деңгейі, бизнес-логика деңгейі және деректер деңгейі; 4) Микросервистік архитектура - жүйе бір-бірімен әрекеттесетін шағын, тәуелсіз қызметтерден тұрады; 5) Service-Oriented Architecture (SOA) - қызметтер стандартталған интерфейстер арқылы байланысады."
            },
            {
                "text": "Үлестірілген жүйелерде қандай қауіпсіздік механизмдері қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Аутентификация, авторизация, шифрлау және аудит",
                        "is_correct": True
                    },
                    {
                        "text": "Тек биометриялық тексеру",
                        "is_correct": False
                    },
                    {
                        "text": "Желілік мониторинг және бейне бақылау",
                        "is_correct": False
                    },
                    {
                        "text": "Физикалық кіруді бақылау және құжаттарды сақтау",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "Үлестірілген деректер базасында (distributed database) қандай деректер репликация стратегиялары қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Толық репликация, толық емес репликация және синхронды/асинхронды репликация",
                        "is_correct": True
                    },
                    {
                        "text": "Тек қана batch репликация",
                        "is_correct": False
                    },
                    {
                        "text": "Деректерді үлестірілген базаларда репликациялау мүмкін емес",
                        "is_correct": False
                    },
                    {
                        "text": "Тек бір бағытты репликация",
                        "is_correct": False
                    }
                ]
            }
        ],
        "Үлкен деректермен жұмыс": [
            {
                "text": "PySpark экожүйесінің негізгі компоненттерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "PySpark экожүйесінің негізгі компоненттері: 1) Spark Core - негізгі функционалдылық, RDD интерфейсі; 2) Spark SQL - құрылымдық деректерді өңдеу; 3) MLlib - машиналық оқыту; 4) GraphX - графтармен жұмыс; 5) Structured Streaming - нақты уақыттағы деректер ағындарын өңдеу. Бұл компоненттер үлкен деректерді параллельді өңдеу, талдау, машиналық оқыту модельдерін құру және графтық талдау үшін қолданылады."
            },
            {
                "text": "Үлкен деректерді өңдеу кезінде қандай архитектуралық шешімдер қолданылады?",
                "type": "open_ended",
                "correct_answer": "Үлкен деректерді өңдеу архитектурасы: 1) Lambda архитектурасы - batch және stream өңдеуді біріктіреді; 2) Kappa архитектурасы - барлық деректерді ағын ретінде өңдейді; 3) Үлестірілген файлдық жүйелер (HDFS, S3); 4) NoSQL дерекқорлары (MongoDB, Cassandra); 5) Деректерді өңдеу құралдары (Spark, Flink); 6) Ресурстарды басқару (YARN, Kubernetes); 7) Деректерді орталықтандыру (Data Lake, Data Warehouse)."
            },
            {
                "text": "Жадыда өңдеу (in-memory processing) технологиясының артықшылықтары қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Жоғары өнімділік, төмен кідіріс және итеративті алгоритмдерді тиімді орындау",
                        "is_correct": True
                    },
                    {
                        "text": "Аз жад қолданымы және төмен процессор жүктемесі",
                        "is_correct": False
                    },
                    {
                        "text": "Жоғары қауіпсіздік және шифрлау",
                        "is_correct": False
                    },
                    {
                        "text": "Деректердің тұрақты сақталуы және резервтік көшірмелер",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "Big Data 4V қасиеттері қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Volume, Velocity, Variety, Veracity",
                        "is_correct": True
                    },
                    {
                        "text": "Visibility, Validation, Value, Visualization",
                        "is_correct": False
                    },
                    {
                        "text": "Virtual, Vector, Variable, Volatile",
                        "is_correct": False
                    },
                    {
                        "text": "Vocabulary, Variance, Verification, Vendibility",
                        "is_correct": False
                    }
                ]
            }
        ],
        "PySpark көмегімен деректерді талдауға кіріспе": [
            {
                "text": "SparkSession-ді құру және конфигурациялау процесін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "SparkSession құру: 1) SparkSession.builder.appName('AppName') - қолданба атауын орнату; 2) config() арқылы параметрлерді орнату (мысалы, .config('spark.executor.memory', '2g')); 3) getOrCreate() әдісін шақыру сессияны құрады немесе бар болса қайтарады. Мысал: spark = SparkSession.builder.appName('MyApp').config('spark.executor.memory', '2g').getOrCreate()"
            },
            {
                "text": "PySpark көмегімен құрылымдық деректерді жүктеу және оқу әдістерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "PySpark-та деректерді жүктеу әдістері: 1) CSV: spark.read.csv('path', header=True, inferSchema=True); 2) JSON: spark.read.json('path'); 3) Parquet: spark.read.parquet('path'); 4) JDBC: spark.read.format('jdbc').options(параметрлер).load(); 5) Сүзгілер қолдану: dataframe.filter(condition); 6) Бағандар таңдау: dataframe.select('column1', 'column2')."
            },
            {
                "text": "DataFrame және RDD арасындағы негізгі айырмашылықтар қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "RDD құрылымсыз, төменгі деңгейлі API, DataFrame құрылымдық, жоғары деңгейлі API",
                        "is_correct": True
                    },
                    {
                        "text": "RDD көп ресурсты қажет етеді, DataFrame аз ресурсты қажет етеді",
                        "is_correct": False
                    },
                    {
                        "text": "RDD SQL запростарын қолдайды, DataFrame тек Python кодын қолдайды",
                        "is_correct": False
                    },
                    {
                        "text": "RDD жаңа Spark нұсқаларында ғана қол жетімді, DataFrame ескі нұсқаларда",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "PySpark-та деректерді жазу үшін қандай әдістер қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "execute(), commit(), save()",
                        "is_correct": False
                    },
                    {
                        "text": "write.csv(), write.json(), write.parquet()",
                        "is_correct": True
                    },
                    {
                        "text": "output(), export(), dump()",
                        "is_correct": False
                    },
                    {
                        "text": "saveToCSV(), saveToJSON(), saveToParquet()",
                        "is_correct": False
                    }
                ]
            }
        ],
        "Деректерді өңдеу": [
            {
                "text": "RDD-мен жұмыс істеу кезіндегі негізгі операцияларды сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "RDD-мен жұмыс істеу кезіндегі негізгі операциялар: 1) Трансформациялар (map, filter, flatMap, union, join) - жаңа RDD жасайды. Мысалы, rdd.map(lambda x: x*2) әр элементті 2-ге көбейтеді; 2) Әрекеттер (actions) (count, collect, reduce, saveAsTextFile) - нәтижелерді қайтарады. Мысалы, rdd.count() элементтер санын қайтарады; 3) Кэштеу (persist, cache) - жадыда сақтау, мысалы rdd.cache() арқылы; 4) Партицияға бөлу (repartition, coalesce) - деректерді қайта ұйымдастыру."
            },
            {
                "text": "PySpark-та mapPartitions және map арасындағы айырмашылық неде?",
                "type": "open_ended",
                "correct_answer": "map және mapPartitions арасындағы айырмашылық: map әр элементке функцияны жеке қолданады, ал mapPartitions толық партицияға функцияны қолданады. mapPartitions әдісі итератор алып, итератор қайтарады және деректерді топпен өңдеу қажет болған кезде өнімділікті жақсартады, бірақ жады қолданымы тұрғысынан тиімді жоспарлауды қажет етеді."
            },
            {
                "text": "RDD-да reduceByKey және groupByKey функцияларының арасындағы өнімділік айырмашылығы неде?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "reduceByKey деректерді бөлгеннен кейін агрегациялайды, groupByKey барлық деректерді бөліп, содан кейін оларды топтастырады",
                        "is_correct": True
                    },
                    {
                        "text": "reduceByKey тек сандық деректермен жұмыс істейді, groupByKey барлық дерек түрлерімен жұмыс істейді",
                        "is_correct": False
                    },
                    {
                        "text": "reduceByKey кем дегенде екі аргументті қажет етеді, groupByKey тек бірді қажет етеді",
                        "is_correct": False
                    },
                    {
                        "text": "reduceByKey деректерді автоматты түрде сұрыптайды, groupByKey сұрыптамайды",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "PySpark-та қандай түрлендіру (transformation) және әрекет (action) амалдарының арасындағы айырмашылық?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Түрлендірулер құрылымдалған деректермен жұмыс істейді, әрекеттер құрылымданбаған деректермен жұмыс істейді",
                        "is_correct": False
                    },
                    {
                        "text": "Түрлендірулер жаңа RDD/DataFrame жасайды және кейінге қалдырылады, әрекеттер нәтижелерді қайтарады және орындалады",
                        "is_correct": True
                    },
                    {
                        "text": "Түрлендірулер тек Spark SQL-де қолданылады, әрекеттер RDD API-де қолданылады",
                        "is_correct": False
                    },
                    {
                        "text": "Түрлендірулер тек Python функцияларын қабылдайды, әрекеттер барлық тілдердегі функцияларды қабылдайды",
                        "is_correct": False
                    }
                ]
            }
        ],
        "Spark құрылымдық ағыны": [
            {
                "text": "Spark Structured Streaming қосымшасын құру процесін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Spark Structured Streaming қосымшасын құру процесі: 1) SparkSession объектісін құру; 2) Ағынды деректер көзін анықтау (readStream көмегімен, мысалы, Kafka, файлдар, сокеттер); 3) Деректерді өңдеу үшін трансформациялар қолдану (select, where, groupBy және т.б.); 4) Нәтижелерді жазу үшін writeStream конфигурациясын анықтау (outputMode, triggerInterval, checkpointLocation); 5) start() әдісімен ағынды өңдеуді бастау; 6) awaitTermination() әдісімен жұмысты аяқтауды күту. Мысалы: spark.readStream.format('kafka').option('subscribe', 'topic1').load().writeStream.format('console').start().awaitTermination()"
            },
            {
                "text": "Spark Streaming және Structured Streaming арасындағы айырмашылықтарды сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Spark Streaming және Structured Streaming арасындағы айырмашылықтар: 1) Spark Streaming RDD-ға негізделген, ал Structured Streaming DataFrame/Dataset API-ге негізделген; 2) Spark Streaming микро-батчтарда жұмыс істейді, ал Structured Streaming оңтайландырылған incremental query жоспарын қолданады; 3) Structured Streaming жоғары деңгейлі семантиканы қамтиды (SQL сұраулары, аналитикалық функциялар); 4) Structured Streaming end-to-end exactly-once кепілдіктерін ұсынады; 5) Structured Streaming event-time өңдеуді, кеш келген деректерді және watermarking-ті қолдайды."
            },
            {
                "text": "Structured Streaming қолданатын output режимдері қандай?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "complete, update, append",
                        "is_correct": True
                    },
                    {
                        "text": "full, incremental, snapshot",
                        "is_correct": False
                    },
                    {
                        "text": "streaming, batching, hybrid",
                        "is_correct": False
                    },
                    {
                        "text": "continuous, discrete, periodic",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "Spark Streaming-те watermarking не үшін қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Ескірген деректерді шектеу және құрылымдарды оңтайландыру үшін",
                        "is_correct": False
                    },
                    {
                        "text": "Деректер ағынының көлемін бақылау үшін",
                        "is_correct": False
                    },
                    {
                        "text": "Кеш келген деректермен жұмыс істеу және жадыны оңтайландыру үшін",
                        "is_correct": True
                    },
                    {
                        "text": "Деректерді шифрлау үшін қолданылатын қауіпсіздік әдісі",
                        "is_correct": False
                    }
                ]
            }
        ],
        "PySpark көмегімен MySQL-ге қосылу": [
            {
                "text": "PySpark-тан MySQL-ге қосылу конфигурациясын сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "PySpark-тан MySQL-ге қосылу конфигурациясы келесі параметрлерді қамтиды: 1) url - JDBC URL мекенжайы; 2) driver - JDBC драйвер класы; 3) dbtable - MySQL таблица атауы; 4) user және password - аутентификация деректері. Мысал: df = spark.read.format('jdbc').options(url='jdbc:mysql://localhost:3306/mydatabase', driver='com.mysql.cj.jdbc.Driver', dbtable='users', user='username', password='secretpassword').load()"
            },
            {
                "text": "PySpark және MySQL арасында деректерді қалай тасымалдауға болады?",
                "type": "open_ended",
                "correct_answer": "PySpark және MySQL арасында деректерді тасымалдау: 1) MySQL-ден оқу: spark.read.format('jdbc').options(параметрлер).load(); 2) MySQL-ге жазу: dataframe.write.format('jdbc').options(параметрлер).mode('append/overwrite').save(); 3) Партиция бойынша оқу: options параметрлерінде partitionColumn, lowerBound, upperBound, numPartitions қосу; 4) Сүзілген деректерді оқу: options параметрінде query немесе dbtable мен predicates көрсету."
            },
            {
                "text": "PySpark JDBC қосылымдарын масштабтау үшін қандай техникалар қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Қосылымдарды пулинг және деректерді партициялау арқылы оқу",
                        "is_correct": True
                    },
                    {
                        "text": "Барлық деректерді бір транзакцияда оқу",
                        "is_correct": False
                    },
                    {
                        "text": "Деректерді тек кэштен оқу",
                        "is_correct": False
                    },
                    {
                        "text": "MySQL-ді PySpark кластерінде жергілікті іске қосу",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "PySpark-та SQL сұрауын тікелей орындау үшін қандай функция қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "executeSQL()",
                        "is_correct": False
                    },
                    {
                        "text": "spark.sql()",
                        "is_correct": True
                    },
                    {
                        "text": "runQuery()",
                        "is_correct": False
                    },
                    {
                        "text": "connection.execute()",
                        "is_correct": False
                    }
                ]
            }
        ],
        "Airflow. Workflows": [
            {
                "text": "Airflow көмегімен workflow құру процесін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Airflow көмегімен workflow құру: 1) DAG объектісін құру (dag_id, schedule_interval, default_args параметрлерімен); 2) Операторларды анықтау (PythonOperator, BashOperator, SparkSubmitOperator және т.б.); 3) Тапсырмалар арасындағы тәуелділіктерді орнату (>> немесе set_upstream/set_downstream әдістері арқылы); 4) DAG файлын Airflow dags қалтасына орналастыру; 5) Airflow веб-интерфейсі арқылы DAG іске қосу және мониторинг жүргізу. Мысалы: with DAG('data_processing', schedule_interval='@daily') as dag: extract = BashOperator(task_id='extract', bash_command='python extract.py'); transform = PythonOperator(task_id='transform', python_callable=transform_function); load = BashOperator(task_id='load', bash_command='python load.py'); extract >> transform >> load"
            },
            {
                "text": "Apache Airflow-да DAG дегеніміз не және оның негізгі қасиеттерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "Apache Airflow-да DAG (Directed Acyclic Graph) - бұл тапсырмаларды (tasks) және олардың арасындағы тәуелділіктерді көрсететін бағытталған ациклдік граф. Негізгі қасиеттері: 1) dag_id - DAG-тің бірегей идентификаторы; 2) description - DAG сипаттамасы; 3) schedule_interval - DAG орындалу жиілігі (cron expression немесе timedelta); 4) start_date - DAG орындалуының басталу уақыты; 5) default_args - барлық тапсырмалар үшін әдепкі параметрлер; 6) catchup - өткізіп алынған орындауларды қуып жетеді ме; 7) max_active_runs - бір уақытта орындалатын DAG нұсқаларының максималды саны."
            },
            {
                "text": "Airflow-да бір тапсырма орындалғаннан кейін басқа тапсырманы орындау үшін қандай әдістер қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "first_task.execute_next(second_task)",
                        "is_correct": False
                    },
                    {
                        "text": "first_task >> second_task немесе second_task.set_upstream(first_task)",
                        "is_correct": True
                    },
                    {
                        "text": "first_task.forward_to(second_task)",
                        "is_correct": False
                    },
                    {
                        "text": "DAG.connect(first_task, second_task)",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "Airflow-дың sensor операторлары не үшін қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Желіні мониторинг жасау үшін",
                        "is_correct": False
                    },
                    {
                        "text": "Тек температура мен ылғалдылық деректерін жинау үшін",
                        "is_correct": False
                    },
                    {
                        "text": "Белгілі бір жағдайды күту (файлдың пайда болуы, мерзімнің жетуі) үшін",
                        "is_correct": True
                    },
                    {
                        "text": "Тек Airflow UI-де табло көрсету үшін",
                        "is_correct": False
                    }
                ]
            }
        ],
        "MLlib: Машиналық оқыту кітапханасы": [
            {
                "text": "MLlib-те машиналық оқыту жұмыс ағынының (ML workflow) негізгі кезеңдерін сипаттаңыз.",
                "type": "open_ended",
                "correct_answer": "MLlib-те машиналық оқыту жұмыс ағынының (ML workflow) негізгі кезеңдері: 1) Деректерді жүктеу (spark.read немесе textFile арқылы); 2) Ерекшеліктерді дайындау (VectorAssembler, StringIndexer, OneHotEncoder және т.б. трансформерлерді қолдану); 3) Деректерді оқыту және тест жиындарына бөлу (randomSplit әдісі); 4) Модельді таңдау және параметрлерді орнату (LogisticRegression, RandomForestClassifier және т.б.); 5) Pipeline құру; 6) Модельді оқыту (fit() әдісі); 7) Болжамдар жасау (transform() әдісі); 8) Модельді бағалау (BinaryClassificationEvaluator немесе MulticlassClassificationEvaluator); 9) Гиперпараметрлерді оңтайландыру (CrossValidator, ParamGridBuilder). Мысалы, pipeline = Pipeline(stages=[indexer, encoder, assembler, classifier]); model = pipeline.fit(trainData); predictions = model.transform(testData); evaluator.evaluate(predictions)"
            },
            {
                "text": "Spark ML Pipeline дегеніміз не және оның қандай артықшылықтары бар?",
                "type": "open_ended",
                "correct_answer": "Spark ML Pipeline - бұл машиналық оқыту жұмыс ағынын құру және орындауға арналған жоғары деңгейлі API. Артықшылықтары: 1) Деректерді дайындау, модельді құру, бағалау кезеңдерін біріктіру; 2) Бірнеше кезеңдерді қамтитын күрделі жұмыс ағындарын ұйымдастыру; 3) Модельдерді сақтау және жүктеу мүмкіндігі; 4) Параметрлерді оңтайландыру (GridSearch, CrossValidation); 5) Бір дәйекті жұмыс ағынында әртүрлі алгоритмдерді біріктіру; 6) Код құрылымын жақсарту және қайта қолдану. Мысалы, pipeline = Pipeline(stages=[tokenizer, hashingTF, lr]); pipelineModel = pipeline.fit(trainingData)"
            },
            {
                "text": "PySpark MLlib-те Cross Validation не үшін қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "Деректерді тазалау және дайындау",
                        "is_correct": False
                    },
                    {
                        "text": "Модельдің гиперпараметрлерін оңтайландыру және овerfitting-ті болдырмау",
                        "is_correct": True
                    },
                    {
                        "text": "Деректерді визуализациялау",
                        "is_correct": False
                    },
                    {
                        "text": "Модельді өндіріске енгізу",
                        "is_correct": False
                    }
                ]
            },
            {
                "text": "MLlib-те қандай функциялар ерекшеліктерді масштабтау үшін қолданылады?",
                "type": "multiple_choice",
                "choices": [
                    {
                        "text": "StandardScaler, MinMaxScaler, MaxAbsScaler, Normalizer",
                        "is_correct": True
                    },
                    {
                        "text": "StringScaler, NumericScaler, VectorScaler",
                        "is_correct": False
                    },
                    {
                        "text": "ColumnScaler, RowScaler, FullScaler",
                        "is_correct": False
                    },
                    {
                        "text": "LevelScaler, RatioScaler, ProportionScaler",
                        "is_correct": False
                    }
                ]
            }
        ]
    }
    
    # Add more subject questions...
    
    # If we have predefined questions for this subject, use them
    if subject in realistic_questions and realistic_questions[subject]:
        # Use up to num_questions questions from our predefined set
        available_questions = realistic_questions[subject][:num_questions]
        
        for i, q_data in enumerate(available_questions, 1):
            question = {
                "id": f"q{i}",
                "text": q_data["text"],
                "type": q_data["type"],
                "points": random.choice([1, 2, 3]),
                "order": i
            }
            
            # Add choices for multiple choice questions
            if q_data["type"] == "multiple_choice":
                choices = []
                correct_index = None
                
                for j, choice in enumerate(q_data["choices"], 1):
                    choices.append({
                        "id": f"q{i}_c{j}",
                        "text": choice["text"],
                        "is_correct": choice["is_correct"]
                    })
                    if choice["is_correct"]:
                        correct_index = j
                
                question["choices"] = choices
            
            # Add correct answer for open-ended questions
            if q_data["type"] == "open_ended":
                question["correct_answer"] = q_data["correct_answer"]
            
            if "explanation" in q_data:
                question["explanation"] = q_data["explanation"]
            
            questions.append(question)
    else:
        # Fallback to generated questions if no predefined questions exist
        for i in range(1, num_questions + 1):
            # Alternate between multiple choice and open-ended questions
            question_type = "multiple_choice" if i % 2 == 0 else "open_ended"
            
            # Generate more natural question text
            if question_type == "multiple_choice":
                question_text = f"{subject} туралы төмендегі тұжырымдардың қайсысы дұрыс?"
            else:
                question_text = f"{subject} бойынша негізгі концепцияларды сипаттаңыз."
            
            question = {
                "id": f"q{i}",
                "text": question_text,
                "type": question_type,
                "points": random.choice([1, 2, 3]),
                "order": i
            }
            
            # Add choices for multiple choice questions
            if question_type == "multiple_choice":
                choices = []
                # Randomly select which choice will be correct
                correct_choice = random.randint(1, 4)
                
                for j in range(1, 5):
                    is_correct = (j == correct_choice)
                    choice_text = f"{subject} бойынша {j}-нұсқа" + (" (дұрыс)" if is_correct else "")
                    
                    choices.append({
                        "id": f"q{i}_c{j}",
                        "text": choice_text,
                        "is_correct": is_correct
                    })
                
                question["choices"] = choices
            else:
                # Add default correct answer for open-ended questions
                question["correct_answer"] = f"{subject} бойынша маңызды концепциялар мен принциптер: 1) Жүйелік архитектура; 2) Деректерді өңдеу; 3) Қауіпсіздік; 4) Масштабталу; 5) Өнімділік оңтайландыру."
            
            questions.append(question)
    
    return questions

def flush_database():
    """Flush database tables related to courses and questions."""
    print("Flushing existing course data...")
    
    # Delete data in reverse order of dependencies
    Choice.objects.all().delete()
    Question.objects.all().delete()
    Test.objects.all().delete()
    Lesson.objects.all().delete()
    Course.objects.all().delete()
    
    print("Database flushed successfully.")

def create_course_with_lessons():
    """Create a course and add lessons to it with detailed quiz data including correct answers."""
    # Create the course
    course, created = Course.objects.get_or_create(
        name="Үлестірілген мәліметтер жүйелері",
        defaults={
            'description': "Бұл курс үлестірілген мәліметтер жүйелерінің негіздерін және үлкен деректерді өңдеу технологияларын қамтиды."
        }
    )
    
    if created:
        print(f"Created new course: {course.name}")
    else:
        print(f"Using existing course: {course.name}")
    
    # Define the lessons data
    lessons_data = [
        {
            "title": "Үлестірілген мәліметтер жүйелеріне кіріспе",
            "description": "Үлестірілген ақпараттық жүйелерді құрудың негізгі принциптері, үлестірілген жүйелердің мысалдары. \"Клиент-сервер\" технологиялары мен модельдері.",
            "video_url": "https://youtube.com/embed/jWW1QB6mzPM",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "Үлестірілген жүйелердің мысалдары: Интернет, веб серверлер, электрондық пошта жүйелері, блокчейн, бұлтты есептеу платформалары, торрент жүйелері, DNS және Hadoop Distributed File System (HDFS)."
            }
        },
        {
            "title": "Үлкен деректер массивтерін өңдеу және талдау технологиялары",
            "description": "Үлкен деректерді анықтау. Үлкен деректерді талдаудың өмірлік циклі, стандарттар. Үлкен деректермен жұмыс істеуге арналған қолданыстағы технологиялар мен кітапханаларға шолу. Қазіргі заманғы қолданбалы және үлестірілген сақтау және үлкен деректерді өңдеу құралдары (MapReduce, Hadoop және Apache Spark).",
            "video_url": "https://youtube.com/embed/mfDOKVp5fOg",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "Hadoop фреймворкінің негізгі компоненттері: 1) HDFS (Hadoop Distributed File System) - деректерді үлестірілген сақтау жүйесі; 2) MapReduce - үлкен деректерді параллельді өңдеу үшін бағдарламалау моделі; 3) YARN (Yet Another Resource Negotiator) - ресурстарды басқару платформасы; 4) Hadoop Common - басқа Hadoop модульдеріне ортақ утилиталар."
            }
        },
        {
            "title": "Үлестірілген жүйелердің архитектурасы",
            "description": "Үлкен деректерді сақтау технологиялары. Таратылған сақтау, NoSql сақтау, жіктеу және мысалдар.",
            "video_url": "https://youtube.com/embed/XkTvuK68rHQ",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "Үлестірілген жүйе архитектурасын жобалау кезінде ескерілетін факторлар: 1) Масштабталу - жүйенің өсуіне дайын болу; 2) Қолжетімділік - жүйе компоненттерінің істен шыққан жағдайда жұмыс істеуді жалғастыру қабілеті; 3) Өнімділік - төмен кідіріс пен жоғары өткізу қабілеті; 4) Қауіпсіздік - аутентификация, авторизация, шифрлау; 5) Үйлесімділік - әртүрлі технологиялармен жұмыс істеу мүмкіндігі; 6) Басқарылатындық - мониторинг, журналдау және конфигурация."
            }
        },
        {
            "title": "Үлкен деректермен жұмыс",
            "description": "Apache Spark және PySpark-пен танысу. Spark Компоненттері. PySpark. Экожүйе. Негізгі ұғымдар. Spark Архитектурасы.",
            "video_url": "https://youtube.com/embed/mOdJ8uL6Il4",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "PySpark экожүйесінің негізгі компоненттері: 1) Spark Core - негізгі функционалдылық, RDD интерфейсі; 2) Spark SQL - құрылымдық деректерді өңдеу; 3) MLlib - машиналық оқыту; 4) GraphX - графтармен жұмыс; 5) Structured Streaming - нақты уақыттағы деректер ағындарын өңдеу. Бұл компоненттер үлкен деректерді параллельді өңдеу, талдау, машиналық оқыту модельдерін құру және графтық талдау үшін қолданылады."
            }
        },
        {
            "title": "PySpark көмегімен деректерді талдауға кіріспе",
            "description": "Pyspark Орнату. Оқу мәліметтерін дайындау. SparkSession - Pyspark кіру нүктесі, SparkSession-ге кіріспе. Pyspark көмегімен файлдарды оқу және жазу. Pyspark көмегімен деректерді оқу және жазу әдістері.",
            "video_url": "https://youtube.com/embed/zAc89O_2doo",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4"
        },
        {
            "title": "Деректерді өңдеу",
            "description": "RDS бағдарламалау. RDD құру. Spark Операциялары.",
            "video_url": "https://youtube.com/embed/HtThtsSAWR8",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "RDD-мен жұмыс істеу кезіндегі негізгі операциялар: 1) Трансформациялар (map, filter, flatMap, union, join) - жаңа RDD жасайды. Мысалы, rdd.map(lambda x: x*2) әр элементті 2-ге көбейтеді; 2) Әрекеттер (actions) (count, collect, reduce, saveAsTextFile) - нәтижелерді қайтарады. Мысалы, rdd.count() элементтер санын қайтарады; 3) Кэштеу (persist, cache) - жадыда сақтау, мысалы rdd.cache() арқылы; 4) Партицияға бөлу (repartition, coalesce) - деректерді қайта ұйымдастыру."
            }
        },
        {
            "title": "Spark құрылымдық ағыны",
            "description": "Пакеттік өңдеу және ағын. Пакеттік деректер. Ағынды өңдеу. Spark Streaming. Деректерді енгізу. Құрылымдық қосымшаны құру.",
            "video_url": "https://youtube.com/embed/4wHb5yTaYAI",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "Spark Structured Streaming қосымшасын құру процесі: 1) SparkSession объектісін құру; 2) Ағынды деректер көзін анықтау (readStream көмегімен, мысалы, Kafka, файлдар, сокеттер); 3) Деректерді өңдеу үшін трансформациялар қолдану (select, where, groupBy және т.б.); 4) Нәтижелерді жазу үшін writeStream конфигурациясын анықтау (outputMode, triggerInterval, checkpointLocation); 5) start() әдісімен ағынды өңдеуді бастау; 6) awaitTermination() әдісімен жұмысты аяқтауды күту. Мысалы: spark.readStream.format('kafka').option('subscribe', 'topic1').load().writeStream.format('console').start().awaitTermination()"
            }
        },
        {
            "title": "PySpark көмегімен MySQL-ге қосылу",
            "description": "MySQL JDBC драйвері бар Payspark. MySQL дерекқорына қосылу параметрлерін анықтау. MySQL деректерін оқу. SQL көмегімен күрделі сұрауларды орындау.",
            "video_url": "https://youtube.com/embed/C1-qnBQAu9c",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "PySpark-тан MySQL-ге қосылу конфигурациясы келесі параметрлерді қамтиды: 1) url - JDBC URL мекенжайы; 2) driver - JDBC драйвер класы; 3) dbtable - MySQL таблица атауы; 4) user және password - аутентификация деректері. Мысал: df = spark.read.format('jdbc').options(url='jdbc:mysql://localhost:3306/mydatabase', driver='com.mysql.cj.jdbc.Driver', dbtable='users', user='username', password='secretpassword').load()"
            }
        },
        {
            "title": "Airflow. Workflows",
            "description": "Графқа шолу. Бағытталмаған графтар. DAG шолуы. Операторлар. Airflow орнату. Docker көмегімен Airflow. Бірінші DAG жасау.",
            "video_url": "https://youtube.com/embed/jWW1QB6mzPM",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "Airflow көмегімен workflow құру: 1) DAG объектісін құру (dag_id, schedule_interval, default_args параметрлерімен); 2) Операторларды анықтау (PythonOperator, BashOperator, SparkSubmitOperator және т.б.); 3) Тапсырмалар арасындағы тәуелділіктерді орнату (>> немесе set_upstream/set_downstream әдістері арқылы); 4) DAG файлын Airflow dags қалтасына орналастыру; 5) Airflow веб-интерфейсі арқылы DAG іске қосу және мониторинг жүргізу. Мысалы: with DAG('data_processing', schedule_interval='@daily') as dag: extract = BashOperator(task_id='extract', bash_command='python extract.py'); transform = PythonOperator(task_id='transform', python_callable=transform_function); load = BashOperator(task_id='load', bash_command='python load.py'); extract >> transform >> load"
            }
        },
        {
            "title": "MLlib: Машиналық оқыту кітапханасы",
            "description": "Корреляцияны Есептеу. Хи-квадрат тесті. Түрлендірулер. Екілік. Негізгі компоненттерді талдау. Нормализатор. Стандартты масштабтау. Min-Max масштабтау. MaxAbsScaler. Биннинг. Жіктеу моделін құру.",
            "video_url": "https://youtube.com/embed/mfDOKVp5fOg",
            "hours": 1,
            "references": "НӘ: 1-4\nҚӘ: 1-4",
            "custom_answers": {
                "open_ended_1": "MLlib-те машиналық оқыту жұмыс ағынының (ML workflow) негізгі кезеңдері: 1) Деректерді жүктеу (spark.read немесе textFile арқылы); 2) Ерекшеліктерді дайындау (VectorAssembler, StringIndexer, OneHotEncoder және т.б. трансформерлерді қолдану); 3) Деректерді оқыту және тест жиындарына бөлу (randomSplit әдісі); 4) Модельді таңдау және параметрлерді орнату (LogisticRegression, RandomForestClassifier және т.б.); 5) Pipeline құру; 6) Модельді оқыту (fit() әдісі); 7) Болжамдар жасау (transform() әдісі); 8) Модельді бағалау (BinaryClassificationEvaluator немесе MulticlassClassificationEvaluator); 9) Гиперпараметрлерді оңтайландыру (CrossValidator, ParamGridBuilder). Мысалы, pipeline = Pipeline(stages=[indexer, encoder, assembler, classifier]); model = pipeline.fit(trainData); predictions = model.transform(testData); evaluator.evaluate(predictions)"
            }
        },
    ]
    
    # Create lessons with detailed quiz data
    created_count = 0
    for i, lesson_data in enumerate(lessons_data, 1):
        # Create more detailed quiz data with actual questions
        num_questions = random.randint(3, 5)
        questions = create_quiz_questions(lesson_data["title"], lesson_data["title"], num_questions)
        
        quiz_data = {
            "title": f"Quiz for {lesson_data['title']}",
            "description": f"This quiz tests your knowledge on {lesson_data['title']}",
            "passing_score": 70,
            "time_limit_minutes": 15,
            "questions": questions,
            "version": "1.0",
            "status": "active"
        }
        
        # Create lesson or update if it exists
        lesson, lesson_created = Lesson.objects.update_or_create(
            course=course,
            title=lesson_data["title"],
            defaults={
                "video_url": lesson_data["video_url"],
                "quiz": quiz_data,
            }
        )
        
        if lesson_created:
            created_count += 1
            print(f"Created lesson {i}: {lesson.title}")
        else:
            print(f"Updated lesson {i}: {lesson.title}")
        
        # Also create a test for this lesson
        test, test_created = Test.objects.update_or_create(
            lesson=lesson,
            defaults={
                "title": f"Тест: {lesson.title}",
                "description": f"Бұл тест '{lesson.title}' бойынша білімді тексеруге арналған.",
                "passing_score": 70,
                "time_limit": 30
            }
        )
        
        if test_created:
            print(f"  Created test: {test.title}")
        else:
            print(f"  Updated test: {test.title}")
            # Delete existing questions if updating
            Question.objects.filter(test=test).delete()
        
        # Create questions for the test based on the quiz questions
        question_count = 0
        open_ended_count = 0
        
        for q_data in questions:
            question_type = QuestionType.MULTIPLE_CHOICE if q_data["type"] == "multiple_choice" else QuestionType.OPEN_ENDED
            
            # Prepare question parameters
            question_params = {
                "test": test,
                "text": q_data["text"],
                "question_type": question_type,
                "points": q_data["points"],
                "order": q_data["order"]
            }
            
            # Add correct answer for open-ended questions
            if question_type == QuestionType.OPEN_ENDED:
                open_ended_count += 1
                # Use custom answer if available
                if "custom_answers" in lesson_data and f"open_ended_{open_ended_count}" in lesson_data["custom_answers"]:
                    question_params["correct_answer"] = lesson_data["custom_answers"][f"open_ended_{open_ended_count}"]
                else:
                    # Use the default correct answer from quiz data if available
                    question_params["correct_answer"] = q_data.get("correct_answer", "")
            
            question = Question.objects.create(**question_params)
            question_count += 1
            
            # Add choices for multiple choice questions
            if question_type == QuestionType.MULTIPLE_CHOICE and "choices" in q_data:
                for choice_data in q_data["choices"]:
                    Choice.objects.create(
                        question=question,
                        text=choice_data["text"],
                        is_correct=choice_data["is_correct"]
                    )
        
        print(f"  Created {question_count} questions for test: {test.title}")
    
    print(f"\nSummary: Created/Updated {created_count} lessons with detailed quiz data in course '{course.name}'")

def main():
    """Main function to run the population script."""
    # Parse command line arguments
    flush_db = False
    if len(sys.argv) > 1 and sys.argv[1] == '--flush':
        flush_db = True
    
    if flush_db:
        flush_database()
    
    create_course_with_lessons()
    
    # Verify open-ended questions have correct answers
    check_open_ended_questions()

def check_open_ended_questions():
    """Verify all open-ended questions have correct answers."""
    missing_answers = Question.objects.filter(
        question_type=QuestionType.OPEN_ENDED,
        correct_answer__isnull=True
    )
    
    if missing_answers.exists():
        print(f"\nWarning: Found {missing_answers.count()} open-ended questions missing correct answers:")
        for q in missing_answers:
            print(f"  - ID {q.id}: {q.text[:50]}...")
    else:
        open_ended_count = Question.objects.filter(question_type=QuestionType.OPEN_ENDED).count()
        print(f"\nSuccess: All {open_ended_count} open-ended questions have correct answers.")

if __name__ == "__main__":
    print("Starting comprehensive database population...")
    main()
    print("\nDatabase population completed successfully.")