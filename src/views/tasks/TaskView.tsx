import Card from '@/components/ui/Card'
import { useState, useEffect } from 'react'
import { fetchTaskVote, getTaskById } from '@/services/TaskApiService'
import { FormItem, Radio, Input, Button, Form } from '@/components/ui'
import { ToastContainer, toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import parse from 'html-react-parser'
import { z, ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ITaskCreateResponse } from '@/@types/task'
import { useSessionUser } from '@/store/authStore'
import classNames from 'classnames'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { shuffleArray } from '@/views/tasks/helpers'

const TaskView = () => {
    const [task, setTask] = useState<ITaskCreateResponse>()
    const params = useParams<{ id: string }>()
    const navigate = useNavigate()

    type FormSchema = {
        inputs: {
            [key: string]: string
        }
        option: number
        reason: string
    }

    const validationSchema: ZodType<FormSchema> = z.object({
        option: z.number({ message: 'Выберите значение' }),
        inputs: z.record(z.string({ message: 'Введите ответ' })),
        reason: z.string({ message: 'Заполните поле' }),
    })

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<FormSchema>({
        defaultValues: {
            inputs: {},
        },
        resolver: zodResolver(validationSchema),
    })

    const [isAccess, setAccess] = useState<boolean>(true)
    const user = useSessionUser((state) => state.user)

    useEffect(() => {
        if (task?.visible === 'PRIVATE' && !user.id) {
            navigate('/auth')
        }
    }, [task, user.id, navigate])

    useEffect(() => {
        const fetchData = async () => {
            if (params.id) {
                try {
                    const task = await getTaskById(+params.id)
                    setTask({
                        ...task,
                        options: shuffleArray(task.options),
                    })
                } catch (e: any) {
                    if (
                        e.response?.status === 401 ||
                        e.response?.status === 400
                    ) {
                        navigate('/auth') // Редирект на страницу авторизации
                    } else {
                        console.error('Ошибка при получении данных:', e)
                        toast.error('Ошибка получения задачи')
                    }
                }
            }
        }
        fetchData().catch((e) => {
            console.error(e)
            toast.error('Ошибка получения задачи')
        })
    }, [params.id, navigate])

    const onSubmit = async (values: FormSchema) => {
        try {
            await fetchTaskVote(
                {
                    reason: values?.reason,
                    optionId: values?.option,
                    inputs: values.inputs,
                },
                task?.id.toString(),
            )
            reset({
                inputs: {},
            })
            window.location.assign('https://opticard.co')
            toast.success('Данные успешно отправлены')
        } catch (error: any) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 400
            ) {
                navigate('/auth') // Редирект на страницу авторизации
            } else {
                console.error(error)
                toast.error('Ошибка выполнения запроса')
            }
        }
    }

    const location = useLocation()
    const regex = /view-task-public/
    const taskClass = classNames({
        'm-auto': regex.test(location.pathname),
        'w-full md:w-3/4': true,
    })

    return (
        <>
            {task && (
                <>
                    <Helmet>
                        <title>{task?.label}</title>
                        <meta name="description" content={task.description} />
                    </Helmet>
                    <div className={taskClass}>
                        <Card
                            header={{
                                content: task?.label,
                            }}
                        >
                            <div className="mt-2">
                                {parse(task.description)}
                            </div>
                        </Card>
                        {task.options.length > 0 && (
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Card
                                    className="mt-5"
                                    header={{
                                        content: 'Опции',
                                    }}
                                >
                                    <FormItem
                                        asterisk
                                        label="Выбирите вариант"
                                        className="mb-0"
                                        invalid={Boolean(errors.option)}
                                        errorMessage={errors.option?.message}
                                    >
                                        <Controller
                                            name="option"
                                            control={control}
                                            render={({ field }) => (
                                                <Radio.Group
                                                    vertical
                                                    {...field}
                                                >
                                                    {task?.options.map((el) => {
                                                        return (
                                                            <Radio
                                                                key={el.id}
                                                                value={el.id}
                                                            >
                                                                <Card
                                                                    key={el.id}
                                                                    header={{
                                                                        content:
                                                                            el.label,
                                                                    }}
                                                                >
                                                                    <p className="mb-4">
                                                                        {
                                                                            el.description
                                                                        }
                                                                    </p>
                                                                    <img
                                                                        className="task-vote-img"
                                                                        src={
                                                                            el.imageUrl
                                                                        }
                                                                        alt=""
                                                                    />
                                                                </Card>
                                                            </Radio>
                                                        )
                                                    })}
                                                </Radio.Group>
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        className="mt-7 mb-1"
                                        label="Причина выбора опции"
                                        invalid={Boolean(errors.reason)}
                                        errorMessage={errors.reason?.message}
                                    >
                                        <Controller
                                            name="reason"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    placeholder="Напишите причину выбора"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </Card>
                                {task.inputs.length > 0 && (
                                    <Card
                                        className="mt-5"
                                        header={{
                                            content: 'Дополнительные вопросы',
                                        }}
                                    >
                                        {task.inputs.map((input) => {
                                            return (
                                                <FormItem
                                                    key={input.id}
                                                    label={input.label}
                                                    invalid={Boolean(
                                                        errors.inputs?.[
                                                            input.id
                                                        ],
                                                    )}
                                                    errorMessage={
                                                        errors.inputs?.[
                                                            input.id
                                                        ]?.message
                                                    }
                                                >
                                                    <Controller
                                                        key={input.id}
                                                        name={`inputs.${input.id.toString()}`}
                                                        control={control}
                                                        render={({ field }) => {
                                                            return (
                                                                <Input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Введите ваш ответ"
                                                                />
                                                            )
                                                        }}
                                                    />
                                                </FormItem>
                                            )
                                        })}
                                    </Card>
                                )}
                                <Button className="mt-5" type="submit">
                                    Отправить
                                </Button>
                            </Form>
                        )}
                    </div>
                </>
            )}
            <ToastContainer />
        </>
    )
}

export default TaskView
