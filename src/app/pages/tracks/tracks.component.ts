import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { InterfaceService } from "src/app/modules/shared/services/interface.service";
import { HttpService } from "src/app/services/http.service";
import { PlayerService } from "src/app/services/player.service";

@Component({
	selector: "app-tracks",
	templateUrl: "./tracks.component.html",
	styleUrls: ["./tracks.component.scss"],
})
export class TracksComponent implements OnInit {
	public tracks = [];
	public pagination = {
		total: 0,
		skip: 0,
		limit: 50,
	};
	public genres = [];
	public loading = true;
	public genre: { name?: string, id?: number } = {};
	public filter: { limit?: number, liked?: boolean, genre?: number, sort?: boolean } = { sort: true, limit: 50, };
	constructor(private httpService: HttpService,
		private interfaceService: InterfaceService,
		private playerService: PlayerService, private route: ActivatedRoute, private router: Router) { }

	public ngOnInit(): void {

		this.route.queryParams.subscribe((params) => {

			console.log(params);
			this.filter = params;



			this.fetchTracks(true);
		});
		this.getGenres();
	}

	public onPlay() {
		if (this.tracks.length > 0) {
			this.playerService.onPlay(...this.tracks);
		}
	}

	public onSort() {
		this.router.navigate(["/tracks"], {
			relativeTo: this.route,
			queryParams: {
				sort: this.filter.sort ? null : true,
			}, queryParamsHandling: "merge",
		});
	}

	public onLiked() {
		this.router.navigate(["/tracks"], {
			relativeTo: this.route,
			queryParams: {
				liked: this.filter.liked ? null : true,
			}, queryParamsHandling: "merge",
		});
		// this.fetchTracks(true);

	}

	public onLimit() {
		const options = [50, 100, 150, 200, 250, 300, 500, 1000];
		this.interfaceService.dialog.show({
			items: options,
			type: "picker",
			title: "Limit",
			message: "Choose how many tracks would you like to load with a single request",
			closed: (index) => {
				if (index !== false) {
					this.router.navigate(["/tracks"], {
						relativeTo: this.route,
						queryParams: {
							limit: options[index],
						}, queryParamsHandling: "merge",
					});

				} else {
					this.router.navigate(["/tracks"], {
						relativeTo: this.route,
						queryParams: {
							limit: null,
						}, queryParamsHandling: "merge",
					});

				}
			},
		});
	}

	public onGenre() {
		this.interfaceService.dialog.show({
			items: this.genres.map((genre) => genre.name),
			type: "picker",
			title: "Genre",
			message: "Choose a genre to filter",
			closed: (index) => {
				if (index !== false) {
					const { id, name } = this.genres[index];
					this.genre = {
						id,
						name
					};
					this.router.navigate(["/tracks"], {
						relativeTo: this.route,
						queryParams: {
							genre: id,
						}, queryParamsHandling: "merge",
					});

				}
			},
		});
	}

	public onClearGenre() {
		this.router.navigate(["/tracks"], {
			relativeTo: this.route,
			queryParams: {
				genre: null,
			}, queryParamsHandling: "merge",
		});

	}

	public getGenres() {
		this.httpService.get(`/genres`).subscribe((response: any[]) => {
			this.genres = response;

			if (this.filter.genre) {
				this.genre = this.genres.find((genre) => genre.id === Number(this.filter.genre));
			}
		});
	}

	public onScroll() {
		console.log("finished scrolling, load more");
		if (this.tracks.length !== this.pagination.total) {
			this.pagination.skip += this.pagination.limit;
			this.fetchTracks();
		}
	}

	private fetchTracks(reset: boolean = false) {
		this.loading = true;

		if (reset) {
			this.tracks = [];
			this.pagination.total = 0;
			this.pagination.skip = 0;
			this.pagination.limit = this.filter.limit ? Number(this.filter.limit) : 50;

		}

		const query = Object.keys(this.filter).filter((k) => k !== "limit").map(k => `${encodeURIComponent(k)}=${encodeURIComponent(this.filter[k])}`).join("&");

		this.httpService.get(`/tracks?skip=${this.pagination.skip}&limit=${this.pagination.limit}&${query}`).subscribe((response: any) => {
			this.tracks = this.tracks.concat(response.tracks);
			this.pagination.total = response.total;
			this.loading = false;
		}, (err) => {
			console.log(err);
		});
	}
}
