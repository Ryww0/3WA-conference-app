import { addDays, addHours } from "date-fns";
import { FixedDateGenerator } from "../../core/adapters/fixed-date-generator";
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository";
import { testUsers } from "../../user/tests/user-seeds";
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository";
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository";
import { testConference } from "../tests/conference-seeds";
import { ChangeDates } from "./change-dates";
import { testBooking } from "../tests/booking-seeds";


describe('Feature: change the dates of conference', () => {
    async function expectDatesRemainUnchanged() {
        const conference = await repository.findById(testConference.conference1.props.id)
        expect(conference?.props.startDate).toEqual(testConference.conference1.props.startDate)
        expect(conference?.props.endDate).toEqual(testConference.conference1.props.endDate)
    }

    let useCase : ChangeDates;
    let repository: InMemoryConferenceRepository
    let dateGenerator: FixedDateGenerator
    let bookingRepository: InMemoryBookingRepository
    let mailer: InMemoryMailer
    let userRepository: InMemoryUserRepository

    beforeEach(async () => {
        repository = new InMemoryConferenceRepository()
        await repository.create(testConference.conference1)

        dateGenerator = new FixedDateGenerator()
        bookingRepository = new InMemoryBookingRepository()
        await bookingRepository.create(testBooking.bobBooking)
        await bookingRepository.create(testBooking.aliceBooking)

        mailer = new InMemoryMailer()
        userRepository = new InMemoryUserRepository()
        await userRepository.create(testUsers.bob)
        await userRepository.create(testUsers.alice)

        useCase = new ChangeDates(
            repository, 
            dateGenerator, 
            bookingRepository, 
            mailer, 
            userRepository
        )
    })

    describe('Scenario: Happy path', () => {
        const startDate = addDays(new Date(), 8)
        const endDate= addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }

        it('should change the dates', async () => {
            await useCase.execute(payload)

            const fetchedConference = await repository.findById(testConference.conference1.props.id)

            expect(fetchedConference?.props.startDate).toEqual(startDate)
            expect(fetchedConference?.props.endDate).toEqual(endDate)
        })

        it('should send an email to the participants', async () => {
            await useCase.execute(payload)

            expect(mailer.sentEmails).toEqual([{
                from: 'TEDx conference',
                to: testUsers.bob.props.emailAddress,
                subject: `The dates of the conference: ${testConference.conference1.props.title}, have changed`,
                body: `The dates of the conference: ${testConference.conference1.props.title}, have changed`
            }, {
                from: 'TEDx conference',
                to: testUsers.alice.props.emailAddress,
                subject: `The dates of the conference: ${testConference.conference1.props.title}, have changed`,
                body: `The dates of the conference: ${testConference.conference1.props.title}, have changed`
            }])
        })
    })

    describe('Scenario: Conference does not exist', () => {
        const startDate = addDays(new Date(), 8)
        const endDate= addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: 'non-existing-id',
            startDate,
            endDate
        }

        it('should fail', async () => {
            await expect(useCase.execute(payload))
                    .rejects
                    .toThrow("Conference not found")
            await expectDatesRemainUnchanged()
        })
    })

    describe('Scenario: Update conference of someone else', () => {
        const startDate = addDays(new Date(), 8)
        const endDate= addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.bob,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }

        it('should fail', async () => {
            await expect(useCase.execute(payload))
                    .rejects
                    .toThrow("You are not allowed to update this conference")

            await expectDatesRemainUnchanged()
        })
    })

    describe('Scenario: The new start date is too close', () => {
        const startDate = new Date('2024-01-02T00:00:00.000Z')
        const endDate= new Date('2024-01-02T02:00:00.000Z')

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }

        it('should fail', async () => {
            await expect(useCase.execute(payload))
                    .rejects
                    .toThrow("The conference must happen in at least 3 days")
            await expectDatesRemainUnchanged()
        })
    })

    describe('Scenario: The updated conference is too long', () => {
        const startDate = new Date('2024-01-04T00:00:00.000Z')
        const endDate= new Date('2024-01-04T05:00:00.000Z')

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }

        it('should fail', async () => {
            await expect(useCase.execute(payload))
                    .rejects
                    .toThrow("The conference is too long (> 3 hours)")
            await expectDatesRemainUnchanged()
        })
    })
})